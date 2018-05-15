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
  private readonly app?: core.Express;
  private server?: http.Server;

  public constructor() {
    this.app = express();
    this.setGlobalSettings();
    this.setServerRoutes();
  }

  public startServer(): boolean {
    logger.info("Starting PagoPa API Mocked Server...");
    if (this.app === undefined) {
      return false;
    }
    this.server = http.createServer(this.app);
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
    const mockedProxyAPIData = new MockedProxyAPIData();

    this.app.get(CONFIG.PAGOPA.SERVICES.LOGIN, (req, res) => {
      if (req.query.username === "mario" && req.query.password === "rossi") {
        res.status(200).json(mockedProxyAPIData.getLoginResponseMocked());
      } else {
        res.status(200).json(mockedProxyAPIData.getLoginResponseErrorMocked());
      }
    });
    this.app.get(CONFIG.PAGOPA.SERVICES.LOGIN_ANONYMOUS, (req, res) => {
      if (
        req.query.email === "mario@mail.it" &&
        req.query.idPayment === "test"
      ) {
        res
          .status(200)
          .json(mockedProxyAPIData.getLoginAnonymousResponseMocked());
      } else {
        res
          .status(200)
          .json(mockedProxyAPIData.getLoginAnonymousResponseErrorMocked());
      }
    });
    this.app.get(CONFIG.PAGOPA.SERVICES.TRANSACTION, (req, res) => {
      if (
        req.query.apiRequestToken !== undefined &&
        req.params.id !== undefined
      ) {
        res
          .status(200)
          .json(
            mockedProxyAPIData.getTransactionListResponseMocked(req.params.id)
          );
      } else {
        res
          .status(200)
          .json(mockedProxyAPIData.getTransactionListResponseErrorMocked());
      }
    });
    this.app.get(CONFIG.PAGOPA.SERVICES.TRANSACTIONS, (req, res) => {
      if (req.query.apiRequestToken !== undefined) {
        res
          .status(200)
          .json(mockedProxyAPIData.getTransactionListResponseMocked(undefined));
      } else {
        res
          .status(200)
          .json(mockedProxyAPIData.getTransactionListResponseErrorMocked());
      }
    });
    this.app.get(CONFIG.PAGOPA.SERVICES.WALLET, (req, res) => {
      if (req.query.apiRequestToken !== undefined) {
        res.status(200).json(mockedProxyAPIData.getWalletResponseMocked());
      } else {
        res.status(200).json(mockedProxyAPIData.getWalletResponseErrorMocked());
      }
    });
    this.app.post(
      CONFIG.PAGOPA.SERVICES.NOTIFICATION_UPDATE_SUBSCRIPTION,
      (req, res) => {
        if (req.body.user.id === "wrongFiscalCode") {
          res
            .status(200)
            .json(mockedProxyAPIData.getNotificationResponseMocked(false));
        } else {
          res
            .status(200)
            .json(mockedProxyAPIData.getNotificationResponseMocked(true));
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
