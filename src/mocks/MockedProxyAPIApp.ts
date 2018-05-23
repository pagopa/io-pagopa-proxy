/**
 * Mock for PagoPaAPI Server
 * Start a server to Mock PagoPaAPI restful webservice
 */

import * as bodyParser from "body-parser";
import * as express from "express";
import * as core from "express-serve-static-core";
import * as http from "http";
import { reporters } from "italia-ts-commons";
import {
  CONFIG,
  Configuration,
  PagoPaConfig,
  ServerConfiguration
} from "../Configuration";
import { logger } from "../utils/Logger";
import * as MockedProxyAPIData from "./MockedProxyAPIData";

// Define server and routes
export function startApp(): http.Server {
  const config = Configuration.decode(CONFIG).getOrElseL(errors => {
    throw new Error(
      `Invalid configuration: ${reporters.readableReport(errors)}`
    );
  });

  logger.info("Starting Proxy PagoPa Server...");
  const app = express();
  setGlobalSettings(app, config.PAGOPA_API);
  setServerRoutes(app, config.PAGOPA_API);
  const server = http.createServer(app);
  server.listen(config.PAGOPA_API.PORT);
  return server;
}

export function stopServer(server: http.Server): void {
  logger.info("Stopping PagoPa Mocked Server...");
  server.close();
}

export function setServerRoutes(app: core.Express, config: PagoPaConfig): void {
  app.post(
    config.SERVICES.NOTIFICATION_UPDATE_SUBSCRIPTION,
    (req: express.Request, res: express.Response) => {
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

export function setGlobalSettings(
  app: core.Express,
  config: ServerConfiguration
): void {
  app.set("port", config.PORT);
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
}
