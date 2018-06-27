/**
 * App
 * Define a Restful and a SOAP Webservice and routes incoming requests to controllers
 */

import * as bodyParser from "body-parser";
import * as express from "express";
import * as core from "express-serve-static-core";
import * as fs from "fs";
import * as http from "http";
import { clients as pagoPASoapClient } from "italia-pagopa-api";
import { FespCdService_WSDL_PATH } from "italia-pagopa-api/dist/lib/wsdl-paths";
import {
  IcdInfoPagamentoInput,
  IcdInfoPagamentoOutput
} from "italia-pagopa-api/dist/wsdl-lib/FespCdService/FespCdPortType";
import { toExpressHandler } from "italia-ts-commons/lib/express";
import * as redis from "redis";
import * as soap from "soap";
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
  const redisClient = redis.createClient(
    config.REDIS_DB.PORT,
    config.REDIS_DB.HOST
  );

  // Define RESTful and SOAP endpoints
  const app = express();
  app.set("port", config.CONTROLLER.PORT);
  setRestfulRoutes(app, config, redisClient, pagoPAClient);
  getSoapServer(
    redisClient,
    config.PAYMENT_ACTIVATION_STATUS_TIMEOUT as number
  )(app);

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
  const urlencodedParser = bodyParser.urlencoded({ extended: false });
  app.get(
    config.CONTROLLER.ROUTES.RESTFUL.PAYMENT_REQUESTS_GET,
    urlencodedParser,
    (req: express.Request, res: express.Response) => {
      logger.info("Serving Payment Check Request (GET)...");
      toExpressHandler(
        PaymentController.paymentRequestsGet(config.PAGOPA, pagoPAClient)
      )(req, res);
    }
  );
  app.post(
    config.CONTROLLER.ROUTES.RESTFUL.PAYMENT_ACTIVATIONS_POST,
    jsonParser,
    (req: express.Request, res: express.Response) => {
      logger.info("Serving Payment Activation Request (POST)...");
      toExpressHandler(
        PaymentController.paymentActivationsPost(config.PAGOPA, pagoPAClient)
      )(req, res);
    }
  );
  app.get(
    config.CONTROLLER.ROUTES.RESTFUL.PAYMENT_ACTIVATIONS_GET,
    urlencodedParser,
    (req: express.Request, res: express.Response) => {
      logger.info("Serving Payment Check Activation Request (GET)...");
      toExpressHandler(PaymentController.paymentActivationsGet(redisClient))(
        req,
        res
      );
    }
  );

  // Endpoint for OpenAPI handler
  app.get("/specs/api/v1/swagger.json", GetOpenapi(publicApiV1Specs));
}

/**
 * Define and return a method to start a SOAP Server for PagoPA
 * @param {redis.RedisClient} redisClient - The redis client used to store information sent by PagoPA
 * @param {redisTimeout} redisTimeout - The timeout to use for information stored into redis
 * @return {(app: core.Express) => soap.Server} A method to execute for start server listening
 */
function getSoapServer(
  redisClient: redis.RedisClient,
  redisTimeout: number
): (app: core.Express) => soap.Server {
  // Configuration for SOAP endpoints and callback handler
  const service = {
    FespCdService: {
      FespCdPortType: {
        cdInfoPagamento: async (
          iCdInfoPagamentoInput: IcdInfoPagamentoInput,
          callback: (iCdInfoPagamentoOutput: IcdInfoPagamentoOutput) => void
        ): Promise<IcdInfoPagamentoOutput> => {
          logger.info("Serving Payment Activation Update Request (SOAP)...");
          const iCdInfoPagamentoOutput = await PaymentController.updatePaymentActivationStatusIntoDB(
            iCdInfoPagamentoInput,
            redisTimeout,
            redisClient
          );
          callback(iCdInfoPagamentoOutput);
          return iCdInfoPagamentoOutput;
        }
      }
    }
  };
  // Retrieve the wsdl related to the endpoint and define a starter function to return
  const wsdl = fs.readFileSync(`${FespCdService_WSDL_PATH}`, "UTF-8");
  return (app: core.Express): soap.Server => {
    return soap.listen(
      app,
      CONFIG.CONTROLLER.ROUTES.SOAP.PAYMENT_ACTIVATIONS_STATUS_UPDATE,
      service,
      wsdl
    );
  };
}
