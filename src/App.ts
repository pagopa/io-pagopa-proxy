/**
 * App
 * Define a Restful Webservice and routes controller requests
 */

import * as bodyParser from "body-parser";
import * as express from "express";
import * as core from "express-serve-static-core";
import * as http from "http";
import { CONFIG } from "./Configuration";
import { NotificationController } from "./controllers/NotificationController";
import { logger } from "./utils/Logger";

// Define server and routes
export class App {
  public static startApp(): http.Server {
    const app = express();
    this.setGlobalSettings(app);
    this.setServerRoutes(app);
    const server = http.createServer(app);
    logger.info("Starting Proxy PagoPa Server...");
    server.listen(CONFIG.CONTROLLER.PORT);
    server.on("error", this.onError);
    return server;
  }

  public static stopServer(server: http.Server): void {
    logger.info("Stopping Proxy PagoPa Server...");
    server.close();
  }

  private static setServerRoutes(app: core.Express): void {
    app.post(CONFIG.CONTROLLER.ROUTES.NOTIFICATION_ACTIVATION, (req, res) => {
      logger.info("Serving Notification Activation Request (POST)...");
      NotificationController.notificationActivation(req, res);
    });
    app.post(CONFIG.CONTROLLER.ROUTES.NOTIFICATION_DEACTIVATION, (req, res) => {
      logger.info("Serving Notification Deactivation REQUEST (POST)...");
      NotificationController.notificationDeactivation(req, res);
    });
  }

  private static setGlobalSettings(app: core.Express): void {
    app.set("port", CONFIG.CONTROLLER.PORT);
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
  }

  private static onError(error: NodeJS.ErrnoException): void {
    if (error.syscall !== "listen") {
      throw error;
    }
    const port = CONFIG.CONTROLLER.PORT;
    switch (error.code) {
      case "EACCES":
        logger.error(`Port ${port} requires elevated privileges`);
        process.exit(1);
        break;
      case "EADDRINUSE":
        logger.error(`Port ${port} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  }
}
