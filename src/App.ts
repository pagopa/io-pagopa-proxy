/**
 * App
 * Define a Restful and a SOAP Webservice and routes incoming requests to controllers
 */

import * as bodyParser from "body-parser";
import * as express from "express";
import * as core from "express-serve-static-core";
import * as http from "http";
import * as t from "io-ts";
import { toExpressHandler } from "italia-ts-commons/lib/express";
import * as morgan from "morgan";
import * as redis from "redis";
import RedisClustr = require("redis-clustr");
import { specs as publicApiV1Specs } from "./api/public_api_pagopa";
import { Configuration } from "./Configuration";
import { GetOpenapi } from "./controllers/openapi";
import * as PaymentController from "./controllers/restful/PaymentController";
import * as FespCdServer from "./services/pagopa_api/FespCdServer";
import * as PPTPortClient from "./services/pagopa_api/PPTPortClient";
import { IFespCdPortTypeSoap } from "./types/pagopa_api/IFespCdPortTypeSoap";
import { cdInfoPagamento_ppt } from "./types/pagopa_api/yaml-to-ts/cdInfoPagamento_ppt";
import { cdInfoPagamentoResponse_ppt } from "./types/pagopa_api/yaml-to-ts/cdInfoPagamentoResponse_ppt";
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
  const pagoPAClient = new PPTPortClient.PagamentiTelematiciPspNodoAsyncClient(
    await PPTPortClient.createPagamentiTelematiciPspNodoClient(
      {
        endpoint: `${config.PAGOPA.HOST}:${config.PAGOPA.PORT}${
          config.PAGOPA.WS_SERVICES.PAGAMENTI
        }`,
        wsdl_options: {
          timeout: config.PAGOPA.CLIENT_TIMEOUT_MSEC
        }
      },
      config.PAGOPA.HOST_HEADER
    )
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
  await FespCdServer.attachFespCdServer(
    app,
    config.CONTROLLER.ROUTES.SOAP.PAYMENT_ACTIVATIONS_STATUS_UPDATE,
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
  pagoPAClient: PPTPortClient.PagamentiTelematiciPspNodoAsyncClient
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
  app.get("/api/v1/swagger.json", GetOpenapi(publicApiV1Specs));

  // Liveness probe for Kubernetes.
  // @see
  // https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-probes/#define-a-liveness-http-request
  app.get("/ping", (_, res) => res.status(200).send("ok"));
}

/**
 * Define a redis client necessary to handle persistent data
 * @param {Configuration} config - Server Configuration
 * @return {(app: core.Express) => soap.Server} A method to execute for start server listening
 */
function getRedisClient(config: Configuration): redis.RedisClient {
  const redisClient = (() => {
    if (config.REDIS_DB.USE_CLUSTER) {
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
    }
    logger.debug("Creating a REDIS client...");
    return redis.createClient(config.REDIS_DB.HOST);
  })();

  redisClient.on("error", err => {
    logger.error(`REDIS Connection error: ${err}`);
  });
  redisClient.on("reconnecting", () => {
    logger.info(`REDIS is trying to reconnect...`);
  });
  redisClient.on("warning", err => {
    logger.warn(`REDIS Connection warning: ${err}`);
  });
  redisClient.on("end", () => {
    logger.error(`REDIS Connection lost`);
  });

  return redisClient;
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
    cdInfoWisp: (
      input: cdInfoPagamento_ppt,
      cb: (
        err: any, // tslint:disable-line:no-any
        result: cdInfoPagamentoResponse_ppt,
        raw: t.StringType,
        soapHeader: { readonly [k: string]: any } // tslint:disable-line:no-any
      ) => any // tslint:disable-line:no-any
    ) => {
      PaymentController.setActivationStatus(
        input,
        redisTimeoutSecs,
        redisClient
      ).then(
        iCdInfoPagamentoOutput => {
          cb(undefined, iCdInfoPagamentoOutput, new t.StringType(), {});
        },
        err => {
          logger.error(`Error on setActivationStatus: ${err}`);
          cb(undefined, { esito: "KO" }, new t.StringType(), {});
        }
      );
    }
  };
}
