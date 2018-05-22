/**
 * Mock for PagoPaAPI Server
 * Start a server to Mock PagoPaAPI restful webservice
 */

// tslint:disable
import * as bodyParser from "body-parser";
import * as express from "express";
import * as core from "express-serve-static-core";
import * as http from "http";
import { GET_CONFIG } from "../Configuration";
import * as MockedProxyAPIData from "./MockedProxyAPIData";
import { logger } from "../utils/Logger";

// Define server and routes
export function startApp(): http.Server {
  logger.info("Starting Proxy PagoPa Server...");
  const app = express();
  setGlobalSettings(app);
  setServerRoutes(app);
  const server = http.createServer(app);
  server.listen(GET_CONFIG().PAGOPA.PORT);
  server.on("error", onError);
  return server;
}

export function stopServer(server: http.Server): void {
  logger.info("Stopping PagoPa Mocked Server...");
  server.close();
}

export function setServerRoutes(app: core.Express): void {
  app.post(
    GET_CONFIG().PAGOPA.SERVICES.NOTIFICATION_UPDATE_SUBSCRIPTION,
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

export function setGlobalSettings(app: core.Express): void {
  app.set("port", GET_CONFIG().PAGOPA.PORT);
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
}

export function onError(error: NodeJS.ErrnoException): void {
  logger.error(
    `Server error ( ${GET_CONFIG().CONTROLLER.HOST} : ${
      GET_CONFIG().CONTROLLER.PORT
    } : ${error.code}`
  );
  process.exit(1);
}
