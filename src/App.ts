/**
 * App
 * Define a Restful and a SOAP Webservice and routes incoming requests to controllers
 */

import * as bodyParser from "body-parser";
import * as express from "express";
import * as core from "express-serve-static-core";
import * as fs from "fs";
import * as http from "http";
import { IcdInfoPagamentoInput } from "italia-pagopa-api/dist/wsdl-lib/FespCdService/FespCdPortType";
import * as redis from "redis";
import * as soap from "soap";
import {
  cdPerNodoWsdl,
  CONFIG,
  Configuration,
  RedisTimeout
} from "./Configuration";
import * as PaymentController from "./controllers/restful/PaymentController";
import { logger } from "./utils/Logger";

// Define and start a WS SOAP\Restful Server
export function startApp(config: Configuration): http.Server {
  logger.info("Starting Proxy PagoPa Server...");
  const redisClient = redis.createClient(
    config.REDIS_DB.PORT,
    config.REDIS_DB.HOST
  );
  const app = express();
  app.set("port", config.CONTROLLER.PORT);
  setRestfulRoutes(app, config, redisClient);
  setSoapServices(app, redisClient, config.PAYMENT_ACTIVATION_STATUS_TIMEOUT);
  const server = http.createServer(app);

  server.listen(config.CONTROLLER.PORT);
  logger.info(
    `Server started at ${config.CONTROLLER.HOST}:${config.CONTROLLER.PORT}`
  );
  return server;
}

export function stopServer(server: http.Server): void {
  logger.info("Stopping Proxy PagoPa Server...");
  server.close();
}

// Set Restful WS routes
function setRestfulRoutes(
  app: core.Express,
  config: Configuration,
  redisClient: redis.RedisClient
): void {
  app.get(config.CONTROLLER.ROUTES.RESTFUL.PAYMENTS_CHECK, (req, res) => {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    logger.info("Serving Payment Check Request (GET)...");
    return PaymentController.checkPaymentToPagoPa(req, res, config.PAGOPA);
  });
  app.post(config.CONTROLLER.ROUTES.RESTFUL.PAYMENTS_ACTIVATION, (req, res) => {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    logger.info("Serving Payment Activation Request (POST)...");
    return PaymentController.activatePaymentToPagoPa(req, res, config.PAGOPA);
  });
  app.get(
    config.CONTROLLER.ROUTES.RESTFUL.PAYMENTS_ACTIVATION_CHECK,
    (req, res) => {
      app.use(bodyParser.json());
      app.use(bodyParser.urlencoded({ extended: false }));
      logger.info("Serving Payment Check Activation Request (GET)...");
      return PaymentController.checkPaymentActivationStatusFromDB(
        req,
        res,
        redisClient
      );
    }
  );
}
// Create Soap services for PagoPA (cdInfoDatiPagamento)
function setSoapServices(
  app: core.Express,
  redisClient: redis.RedisClient,
  statusTimeout: RedisTimeout
): void {
  const wsdl = fs.readFileSync(`${__dirname}${cdPerNodoWsdl}`, "UTF-8");
  const service = {
    FespCdService: {
      FespCdPortType: {
        cdInfoPagamento: (
          input: IcdInfoPagamentoInput,
          callback: () => void
        ): void => {
          PaymentController.updatePaymentActivationStatusIntoDB(
            input,
            statusTimeout,
            redisClient,
            callback
          );
        }
      }
    }
  };

  soap.listen(
    app,
    CONFIG.CONTROLLER.ROUTES.SOAP.PAYMENTS_ACTIVATION_STATUS_UPDATE,
    service,
    wsdl
  );
}
