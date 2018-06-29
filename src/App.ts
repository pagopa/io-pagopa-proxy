/**
 * App
 * Define a Restful and a SOAP Webservice and routes incoming requests to controllers
 */

import * as bodyParser from "body-parser";
import * as express from "express";
import * as core from "express-serve-static-core";
import * as http from "http";
import { clients as pagoPASoapClient } from "italia-pagopa-api";
import { attachFespCdServer } from "italia-pagopa-api/dist/lib/servers";
import {
  Esito,
  IcdInfoPagamentoInput,
  IcdInfoPagamentoOutput,
  IFespCdPortTypeSoap
} from "italia-pagopa-api/dist/wsdl-lib/FespCdService/FespCdPortType";
import { toExpressHandler } from "italia-ts-commons/lib/express";
import * as morgan from "morgan";
import * as redis from "redis";
import RedisClustr = require("redis-clustr");
import { specs as publicApiV1Specs } from "./api/public_api_pagopa";
import { CONFIG, Configuration } from "./Configuration";
import { GetOpenapi } from "./controllers/openapi";
import * as PaymentController from "./controllers/restful/PaymentController";
import { logger } from "./utils/Logger";

/**
 * Define and start an express Server
 * to expose RESTful and SOAP endpoints for BackendApp and Proxy requests.
 * @param {Configuration} config - The server configuration to use
 * @return {Promise<http.Server>} The express server defined and started
 */
export async function startApp(config: Configuration): Promise<http.Server> {
  logger.info("Starting Proxy PagoPA Server...");

  // Define SOAP Clients for PagoPA SOAP WS
  // It is necessary to forward BackendApp requests to PagoPA
  const pagoPAClient = new pagoPASoapClient.PagamentiTelematiciPspNodoAsyncClient(
    await pagoPASoapClient.createPagamentiTelematiciPspNodoClient({
      endpoint: `${config.PAGOPA.HOST}:${config.PAGOPA.PORT}${
        config.PAGOPA.WS_SERVICES.PAGAMENTI
      }?wsdl`
    })
  );

  // Define a redis client necessary to handle persistent data
  // for async payment activation process
  const redisClient = getRedisClient(config);

  // Define RESTful endpoints
  const app = express();
  app.set("port", config.CONTROLLER.PORT);
  const loggerFormat =
    ":date[iso] [info]: :method :url :status - :response-time ms";
  app.use(morgan(loggerFormat));
  setRestfulRoutes(app, config, redisClient, pagoPAClient);

  // Define SOAP endpoints
  const fespCdServiceHandler = getFespCdServiceHandler(
    redisClient,
    config.PAYMENT_ACTIVATION_STATUS_TIMEOUT_SECONDS
  );
  await attachFespCdServer(
    app,
    CONFIG.CONTROLLER.ROUTES.SOAP.PAYMENT_ACTIVATIONS_STATUS_UPDATE,
    fespCdServiceHandler
  );

  const server = http.createServer(app);
  server.listen(config.CONTROLLER.PORT);

  logger.info(
    `Server started at ${config.CONTROLLER.HOST}:${config.CONTROLLER.PORT}`
  );
  return server;
}

export function stopServer(server: http.Server): void {
  logger.info("Stopping Proxy PagoPA Server...");
  server.close();
}

/**
 * Set RESTful WS endpoints
 * @param {core.Express} app - Express server to set
 * @param {Configuration} config - PagoPa proxy configuration
 * @param {redis.RedisClient} redisClient - The redis client used to store information sent by PagoPA
 * @param {PagamentiTelematiciPspNodoAsyncClient} pagoPAClient - PagoPa SOAP client to call verificaRPT and attivaRPT services
 */
function setRestfulRoutes(
  app: core.Express,
  config: Configuration,
  redisClient: redis.RedisClient,
  pagoPAClient: pagoPASoapClient.PagamentiTelematiciPspNodoAsyncClient
): void {
  const jsonParser = bodyParser.json();

  const getPaymentInfoHandler = toExpressHandler(
    PaymentController.getPaymentInfo(config.PAGOPA, pagoPAClient)
  );
  app.get(
    config.CONTROLLER.ROUTES.RESTFUL.PAYMENT_REQUESTS_GET,
    getPaymentInfoHandler
  );

  const activatePaymentHandler = toExpressHandler(
    PaymentController.activatePayment(config.PAGOPA, pagoPAClient)
  );
  app.post(
    config.CONTROLLER.ROUTES.RESTFUL.PAYMENT_ACTIVATIONS_POST,
    jsonParser,
    activatePaymentHandler
  );

  const getActivationStatusHandler = toExpressHandler(
    PaymentController.getActivationStatus(redisClient)
  );
  app.get(
    config.CONTROLLER.ROUTES.RESTFUL.PAYMENT_ACTIVATIONS_GET,
    getActivationStatusHandler
  );

  // Endpoint for OpenAPI handler
  app.get("/specs/api/v1/swagger.json", GetOpenapi(publicApiV1Specs));
}

/**
 * Define a redis client necessary to handle persistent data
 * @param {Configuration} config - Server Configuration
 * @return {(app: core.Express) => soap.Server} A method to execute for start server listening
 */
function getRedisClient(config: Configuration): redis.RedisClient {
  if (!config.REDIS_DB.USE_CLUSTER) {
    logger.debug("Creating a REDIS client...");
    return redis.createClient(config.REDIS_DB.HOST);
  }
  logger.debug("Creating a REDIS client using cluster...");
  return new RedisClustr({
    redisOptions: {
      auth_pass: config.REDIS_DB.PASSWORD,
      tls: {
        servername: config.REDIS_DB.HOST
      }
    },
    servers: [
      {
        host: config.REDIS_DB.HOST,
        port: config.REDIS_DB.PORT
      }
    ]
  }) as redis.RedisClient;
  return redis.createClient(config.REDIS_DB.PORT);
}

/**
 * Define a Service Handler for FespCdService SOAP service
 * It's an endpoint for PagoPA to confirm a payment activation result
 * @param {redis.RedisClient} redisClient - Redis Client to store persistente paymentId into DB
 * @param {number} redisTimeoutSecs - Timeout set for information stored into DB
 * @return {IFespCdPortTypeSoap} An object containing the service handler
 */
function getFespCdServiceHandler(
  redisClient: redis.RedisClient,
  redisTimeoutSecs: number
): IFespCdPortTypeSoap {
  return {
    cdInfoPagamento: (
      iCdInfoPagamentoInput: IcdInfoPagamentoInput,
      callback: (
        err: any | null, // tslint:disable-line:no-any
        iCdInfoPagamentoOutput: IcdInfoPagamentoOutput,
        raw: string,
        soapHeader: { readonly [k: string]: any } // tslint:disable-line:no-any
      ) => void
    ) => {
      PaymentController.setActivationStatus(
        iCdInfoPagamentoInput,
        redisTimeoutSecs,
        redisClient
      ).then(
        iCdInfoPagamentoOutput => {
          callback(undefined, iCdInfoPagamentoOutput, "", {});
        },
        err => {
          logger.debug(`Error on setActivationStatus: ${err}`);
          callback(
            undefined,
            {
              esito: Esito.KO
            },
            "",
            {}
          );
        }
      );
    }
  };
}
