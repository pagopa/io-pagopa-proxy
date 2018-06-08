/**
  * App
  * Define a Restful and a SOAP Webservice and routes incoming requests to controllers
  */

import * as bodyParser from "body-parser";
import * as express from "express";
import * as core from "express-serve-static-core";
import * as http from "http";
import { Configuration } from "./Configuration";
import * as PaymentController from "./controllers/restful/PaymentController";
import { logger } from "./utils/Logger";

// Define and start a WS SOAP\Restful Server
export function startApp(config: Configuration): http.Server {
  logger.info("Starting Proxy PagoPa Server...");
  const app = express();
  app.set("port", config.CONTROLLER.PORT);
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  setRestfulRoutes(app, config);
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
function setRestfulRoutes(app: core.Express, config: Configuration): void {
  app.get(config.CONTROLLER.ROUTES.RESTFUL.PAYMENTS_CHECK, (req, res) => {
    logger.info("Serving Payment Check Request (GET)...");
    return PaymentController.checkPaymentToPagoPa(req, res, config.PAGOPA);
  });
  app.post(config.CONTROLLER.ROUTES.RESTFUL.PAYMENTS_ACTIVATION, (req, res) => {
    logger.info("Serving Payment Activation Request (POST)...");
    return PaymentController.activatePaymentToPagoPa(req, res, config.PAGOPA);
  });
}
