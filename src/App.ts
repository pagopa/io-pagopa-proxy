/**
 * App
 * Define a Restful and a SOAP Webservice and routes incoming requests to controllers
 */

import * as bodyParser from "body-parser";
import * as express from "express";
import * as core from "express-serve-static-core";
import * as http from "http";
import { clients as pagoPaSoapClient } from "italia-pagopa-api";
import { PPTPortTypes } from "italia-pagopa-api/dist/wsdl-lib/PagamentiTelematiciPspNodoservice/PPTPort";
import { Configuration } from "./Configuration";
import * as PaymentController from "./controllers/restful/PaymentController";
import { logger } from "./utils/Logger";

// Define and start a WS SOAP\Restful Server
export async function startApp(config: Configuration): Promise<http.Server> {
  logger.info("Starting Proxy PagoPa Server...");

  // Define SOAP Clients necessary to send messages to PagoPa SOAP WS
  const verificaRPTPagoPaClient = new pagoPaSoapClient.PagamentiTelematiciPspNodoAsyncClient(
    await pagoPaSoapClient.createPagamentiTelematiciPspNodoClient({
      endpoint: `${config.PAGOPA.HOST}:${config.PAGOPA.PORT}${
        config.PAGOPA.SERVICES.PAYMENTS_CHECK
      }`,
      envelopeKey: PPTPortTypes.envelopeKey
    })
  );
  const attivaRPTPagoPaClient = new pagoPaSoapClient.PagamentiTelematiciPspNodoAsyncClient(
    await pagoPaSoapClient.createPagamentiTelematiciPspNodoClient({
      endpoint: `${config.PAGOPA.HOST}:${config.PAGOPA.PORT}${
        config.PAGOPA.SERVICES.PAYMENTS_ACTIVATION
      }`,
      envelopeKey: PPTPortTypes.envelopeKey
    })
  );

  // Define endpoints and start SOAP + RESTFUL WS
  const app = express();
  app.set("port", config.CONTROLLER.PORT);
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  setRestfulRoutes(app, config, verificaRPTPagoPaClient, attivaRPTPagoPaClient);
  const server = http.createServer(app);
  server.listen(config.CONTROLLER.PORT);
  logger.info(
    `Server started at ${config.CONTROLLER.HOST}:${config.CONTROLLER.PORT}`
  );
  return server;
}

export function stopServer(server: http.Server): void {
  logger.info("Stopping Proxy PagoPa Server...");
  server.close();
}

// Set Restful WS routes
function setRestfulRoutes(
  app: core.Express,
  config: Configuration,
  verificaRPTPagoPaClient: pagoPaSoapClient.PagamentiTelematiciPspNodoAsyncClient,
  attivaRPTPagoPaClient: pagoPaSoapClient.PagamentiTelematiciPspNodoAsyncClient
): void {
  app.get(
    config.CONTROLLER.ROUTES.RESTFUL.PAYMENTS_CHECK,
    (req: express.Request, res: express.Response) => {
      logger.info("Serving Payment Check Request (GET)...");
      return PaymentController.checkPaymentToPagoPa(
        req,
        res,
        config.PAGOPA,
        verificaRPTPagoPaClient
      );
    }
  );
  app.post(
    config.CONTROLLER.ROUTES.RESTFUL.PAYMENTS_ACTIVATION,
    (req: express.Request, res: express.Response) => {
      logger.info("Serving Payment Activation Request (POST)...");
      return PaymentController.activatePaymentToPagoPa(
        req,
        res,
        config.PAGOPA,
        attivaRPTPagoPaClient
      );
    }
  );
}
