/**
 * App
 * Define a Restful Webservice and routes controller requests
 */

import * as bodyParser from "body-parser";
import * as express from "express";
import * as core from "express-serve-static-core";
import * as http from "http";
import { reporters } from "italia-ts-commons";
import { CONFIG, Configuration, ServerConfiguration } from "./Configuration";
import * as NotificationController from "./controllers/NotificationController";
import * as PaymentController from "./controllers/PaymentController";
import { logger } from "./utils/Logger";

// Define server and routes
export function startApp(): http.Server {
  const config = Configuration.decode(CONFIG).getOrElseL(errors => {
    throw new Error(
      `Invalid configuration: ${reporters.readableReport(errors)}`
    );
  });

  const app = express();
  setGlobalSettings(app, config.CONTROLLER);
  setServerRoutes(app, config);
  const server = http.createServer(app);
  logger.info("Starting Proxy PagoPa Server...");
  server.listen(config.CONTROLLER.PORT);
  return server;
}

export function stopServer(server: http.Server): void {
  logger.info("Stopping Proxy PagoPa Server...");
  server.close();
}

function setServerRoutes(app: core.Express, config: Configuration): void {
  app.post(config.CONTROLLER.ROUTES.NOTIFICATIONS_ACTIVATION, (req, res) => {
    logger.info("Serving Notification Activation Request (POST)...");
    return NotificationController.activateNotificationsSubscription(
      req,
      res,
      config.PAGOPA_API
    );
  });

  app.post(config.CONTROLLER.ROUTES.NOTIFICATIONS_DEACTIVATION, (req, res) => {
    logger.info("Serving Notification Deactivation Request (POST)...");
    return NotificationController.deactivateNotificationsSubscription(
      req,
      res,
      config.PAGOPA_API
    );
  });

  app.put(CONFIG.CONTROLLER.ROUTES.NOTIFICATIONS_DISPATCHER, (req, res) => {
    console.log(
      "Receiving a new Notification to dispatch from PagoPa API (PUT)..."
    );
    return NotificationController.dispatchNotification(
      req,
      res,
      config.CDAVVISI_API
    );
  });

  app.post(CONFIG.CONTROLLER.ROUTES.PAYMENTS_ACTIVATION, (req, res) => {
    console.log("Serving Payment Activation Request (POST)...");
    return PaymentController.activatePayment(req, res, config.PAGOPA_API);
  });

  app.get(CONFIG.CONTROLLER.ROUTES.PAYMENTS_CHECK, (req, res) => {
    console.log("Serving Payment Check Request (GET)...");
    return PaymentController.checkPayment(req, res, config.PAGOPA_API);
  });

  app.post(CONFIG.CONTROLLER.ROUTES.PAYMENTS_STATUS_UPDATE, (req, res) => {
    console.log(
      "Receiving an update for a payment activation status (POST)..."
    );
    return PaymentController.notifyPaymentStatus(req, res, config.CDAVVISI_API);
  });
}

function setGlobalSettings(
  app: core.Express,
  config: ServerConfiguration
): void {
  app.set("port", config.PORT);
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
}
