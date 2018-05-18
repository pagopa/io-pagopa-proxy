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
import { NotificationSubscriptionRequestType } from "./enums/NotificationSubscriptionType";
import { logger } from "./utils/Logger";

// Define server and routes
export class App {
  private readonly app: core.Express;
  private readonly server: http.Server;

  public constructor() {
    this.app = express();
    this.setGlobalSettings();
    this.setServerRoutes();
    this.server = http.createServer(this.app);
  }

  public startServer(): boolean {
    logger.info("Starting Proxy PagoPa Server...");
    this.server.listen(this.getServerPort());
    this.server.on("error", this.onError);
    return true;
  }

  public stopServer(): boolean {
    logger.info("Stopping Proxy PagoPa Server...");
    if (this.server === undefined) {
      return false;
    }
    this.server.close();
    return true;
  }

  private setServerRoutes(): boolean {
    if (this.app === undefined) {
      return false;
    }
    this.app.post(
      CONFIG.CONTROLLER.ROUTES.NOTIFICATION_ACTIVATION(),
      (req, res) => {
        logger.info("Serving Notification Activation Request (POST)...");
        NotificationController.updateSubscription(
          req,
          res,
          NotificationSubscriptionRequestType.ACTIVATION
        );
      }
    );
    this.app.post(
      CONFIG.CONTROLLER.ROUTES.NOTIFICATION_DEACTIVATION(),
      (req, res) => {
        logger.info("Serving Notification Deactivation REQUEST (POST)...");
        NotificationController.updateSubscription(
          req,
          res,
          NotificationSubscriptionRequestType.DEACTIVATION
        );
      }
    );
    return true;
  }

  private setGlobalSettings(): boolean {
    if (this.app === undefined) {
      return false;
    }
    this.app.set("port", this.getServerPort());
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    return true;
  }

  private getServerPort(): number {
    if (CONFIG.CONTROLLER.PORT === undefined) {
      throw Error("Cannot use undefined port for Server!");
    }
    if (typeof CONFIG.CONTROLLER.PORT === "string") {
      const portNumber = parseInt(CONFIG.CONTROLLER.PORT, 10);
      if (portNumber > 0) {
        return portNumber;
      }
    } else if (
      typeof CONFIG.CONTROLLER.PORT === "number" &&
      CONFIG.CONTROLLER.PORT > 0
    ) {
      return CONFIG.CONTROLLER.PORT;
    }
    throw Error("Invalid port defined for Server");
  }

  private onError(error: NodeJS.ErrnoException): void {
    if (error.syscall !== "listen") {
      throw error;
    }
    const bind = "Port " + String(this.getServerPort());
    switch (error.code) {
      case "EACCES":
        logger.error(`${bind} requires elevated privileges`);
        process.exit(1);
        break;
      case "EADDRINUSE":
        logger.error(`${bind} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  }
}
