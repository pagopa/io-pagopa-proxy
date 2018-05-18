/**
 * Mock for PagoPaAPI Server
 * Start a server to Mock PagoPaAPI restful webservice
 */

// tslint:disable
import * as bodyParser from "body-parser";
import * as debug from "debug";
import * as express from "express";
import * as core from "express-serve-static-core";
import * as http from "http";
import { CONFIG } from "../Configuration";
import { MockedProxyAPIData } from "./MockedProxyAPIData";
import { logger } from "../utils/Logger";

// Define server and routes
debug("ts-express:server");

export class MockedProxyAPIApp {
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
    this.server.listen(CONFIG.PAGOPA.PORT);
    this.server.on("error", this.onError);
    this.server.on("listening", this.onListening);
    return true;
  }

  public stopServer(): boolean {
    logger.info("Stopping PagoPa Mocked Server...");
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
      CONFIG.PAGOPA.SERVICES.NOTIFICATION_UPDATE_SUBSCRIPTION,
      (req, res) => {
        if (req.body.user.id === "wrongFiscalCode") {
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
    return true;
  }

  private setGlobalSettings(): boolean {
    if (this.app === undefined) {
      return false;
    }
    this.app.set("port", String(CONFIG.PAGOPA.PORT));
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    return true;
  }

  private onError(error: NodeJS.ErrnoException): void {
    if (error.syscall !== "listen") {
      throw error;
    }
    const bind = "Port " + String(CONFIG.PAGOPA.PORT);
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

  private onListening(): boolean {
    if (this.server === undefined) {
      return false;
    }
    const addr = this.server.address();
    const bind =
      typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;
    debug(`Listening on ${bind}`);
    return true;
  }
}
