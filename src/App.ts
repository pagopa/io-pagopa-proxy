/**
 * App
 * Define a Restful and a SOAP Webservice and routes incoming requests to controllers
 */

import * as bodyParser from "body-parser";
import * as express from "express";
import * as core from "express-serve-static-core";
import * as http from "http";
import { reporters } from "italia-ts-commons";
import { CONFIG, Configuration } from "./Configuration";
import * as PaymentController from "./controllers/restful/PaymentController";
import { logger } from "./utils/Logger";

// Define and start a WS SOAP\Restful Server
export function startApp(): http.Server {
  const config = Configuration.decode(CONFIG).getOrElseL(errors => {
    throw new Error(
      `Invalid configuration: ${reporters.readableReport(errors)}`
    );
  });

  const app = express();
  app.set("port", config.CONTROLLER.PORT);
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  setRestfulRoutes(app);
  const server = http.createServer(app);
  logger.info("Starting Proxy PagoPa Server...");
  server.listen(config.CONTROLLER.PORT);
  return server;
}

export function stopServer(server: http.Server): void {
  logger.info("Stopping Proxy PagoPa Server...");
  server.close();
}

// Set Restful WS routes
function setRestfulRoutes(app: core.Express): void {
  app.get(CONFIG.CONTROLLER.ROUTES.RESTFUL.PAYMENTS_CHECK, (req, res) => {
    console.log("Serving Payment Check Request (GET)...");
    return PaymentController.checkPaymentToPagoPa(req, res);
  });
  app.post(CONFIG.CONTROLLER.ROUTES.RESTFUL.PAYMENTS_ACTIVATION, (req, res) => {
    console.log("Serving Payment Activation Request (POST)...");
    return PaymentController.activatePaymentToPagoPa(req, res);
  });
}
