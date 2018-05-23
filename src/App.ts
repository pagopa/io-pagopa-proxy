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
  app.post(config.CONTROLLER.ROUTES.NOTIFICATION_ACTIVATION, (req, res) => {
    logger.info("Serving Notification Activation Request (POST)...");
    return NotificationController.activateNotificationsSubscription(
      req,
      res,
      config.PAGOPA_API
    );
  });
  app.post(config.CONTROLLER.ROUTES.NOTIFICATION_DEACTIVATION, (req, res) => {
    logger.info("Serving Notification Deactivation REQUEST (POST)...");
    return NotificationController.deactivateNotificationsSubscription(
      req,
      res,
      config.PAGOPA_API
    );
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
