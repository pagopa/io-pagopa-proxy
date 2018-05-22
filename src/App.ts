/**
 * App
 * Define a Restful Webservice and routes controller requests
 */

import * as bodyParser from "body-parser";
import * as express from "express";
import * as core from "express-serve-static-core";
import * as http from "http";
import * as Configuration from "./Configuration";
import * as NotificationController from "./controllers/NotificationController";
import { logger } from "./utils/Logger";

// Define server and routes
export function startApp(): http.Server {
  const config = Configuration.GET_CONFIG();
  const app = express();
  setGlobalSettings(app, config);
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

function setServerRoutes(
  app: core.Express,
  config: Configuration.Configuration
): void {
  app.post(config.CONTROLLER.ROUTES.NOTIFICATION_ACTIVATION, (req, res) => {
    logger.info("Serving Notification Activation Request (POST)...");
    NotificationController.notificationActivation(req, res, config.PAGOPA_API);
  });
  app.post(config.CONTROLLER.ROUTES.NOTIFICATION_DEACTIVATION, (req, res) => {
    logger.info("Serving Notification Deactivation REQUEST (POST)...");
    NotificationController.notificationDeactivation(
      req,
      res,
      config.PAGOPA_API
    );
  });
}

function setGlobalSettings(
  app: core.Express,
  config: Configuration.Configuration
): void {
  app.set("port", config.CONTROLLER.PORT);
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
}
