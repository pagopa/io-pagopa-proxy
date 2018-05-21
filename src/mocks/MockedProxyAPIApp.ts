/**
 * Mock for PagoPaAPI Server
 * Start a server to Mock PagoPaAPI restful webservice
 */

// tslint:disable
import * as bodyParser from "body-parser";
import * as express from "express";
import * as core from "express-serve-static-core";
import * as http from "http";
import { CONFIG } from "../Configuration";
import { MockedProxyAPIData } from "./MockedProxyAPIData";
import { logger } from "../utils/Logger";

// Define server and routes
export class MockedProxyAPIApp {
  public static startApp(): http.Server {
    logger.info("Starting Proxy PagoPa Server...");
    const app = express();
    this.setGlobalSettings(app);
    this.setServerRoutes(app);
    const server = http.createServer(app);
    server.listen(CONFIG.PAGOPA.PORT);
    server.on("error", this.onError);
    return server;
  }

  public static stopServer(server: http.Server): void {
    logger.info("Stopping PagoPa Mocked Server...");
    server.close();
  }

  private static setServerRoutes(app: core.Express): void {
    app.post(
      CONFIG.PAGOPA.SERVICES.NOTIFICATION_UPDATE_SUBSCRIPTION,
      (req, res) => {
        if (req.body.user.id === "BADBAD88H22A089A") {
          res
            .status(200)
            .json(MockedProxyAPIData.getNotificationResponseMocked(false));
        } else {
          res
            .status(200)
            .json(MockedProxyAPIData.getNotificationResponseMocked(true));
        }
      }
    );
  }

  private static setGlobalSettings(app: core.Express): void {
    app.set("port", CONFIG.PAGOPA.PORT);
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
  }

  private static onError(error: NodeJS.ErrnoException): void {
    if (error.syscall !== "listen") {
      throw error;
    }
    switch (error.code) {
      case "EACCES":
        logger.error(`Port ${CONFIG.PAGOPA.PORT} requires elevated privileges`);
        process.exit(1);
        break;
      case "EADDRINUSE":
        logger.error(`Port ${CONFIG.PAGOPA.PORT} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  }
}
