/**
 * App
 * Define a Restful and a SOAP Webservice and routes incoming requests to controllers
 */

import * as bodyParser from "body-parser";
import * as express from "express";
import * as core from "express-serve-static-core";
import * as fs from "fs";
import * as http from "http";
import { clients as pagoPaSoapClient } from "italia-pagopa-api";
import { IcdInfoPagamentoInput } from "italia-pagopa-api/dist/wsdl-lib/FespCdService/FespCdPortType";
import { PPTPortTypes } from "italia-pagopa-api/dist/wsdl-lib/PagamentiTelematiciPspNodoservice/PPTPort";
import { toExpressHandler } from "italia-ts-commons/lib/express";
import * as redis from "redis";
import * as soap from "soap";
import {
  cdPerNodoWsdl,
  CONFIG,
  Configuration,
  RedisTimeout
} from "./Configuration";
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

  // Define a redis client necessary to handle persistent data for activationPayment services
  const redisClient = redis.createClient(
    config.REDIS_DB.PORT,
    config.REDIS_DB.HOST
  );

  // Define endpoints and start SOAP + RESTFUL WS
  const app = express();
  app.set("port", config.CONTROLLER.PORT);
  setRestfulRoutes(
    app,
    config,
    redisClient,
    verificaRPTPagoPaClient,
    attivaRPTPagoPaClient
  );
  setSoapServices(app, redisClient, config.PAYMENT_ACTIVATION_STATUS_TIMEOUT);
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
  redisClient: redis.RedisClient,
  verificaRPTPagoPaClient: pagoPaSoapClient.PagamentiTelematiciPspNodoAsyncClient,
  attivaRPTPagoPaClient: pagoPaSoapClient.PagamentiTelematiciPspNodoAsyncClient
): void {
  app.get(
    config.CONTROLLER.ROUTES.RESTFUL.PAYMENTS_CHECK,
    (req: express.Request, res: express.Response) => {
      logger.info("Serving Payment Check Request (GET)...");
      app.use(bodyParser.json());
      app.use(bodyParser.urlencoded({ extended: false }));
      toExpressHandler(
        PaymentController.checkPaymentToPagoPa(
          config.PAGOPA,
          verificaRPTPagoPaClient
        )
      )(req, res);
    }
  );
  app.post(
    config.CONTROLLER.ROUTES.RESTFUL.PAYMENTS_ACTIVATION,
    (req: express.Request, res: express.Response) => {
      logger.info("Serving Payment Activation Request (POST)...");
      app.use(bodyParser.json());
      app.use(bodyParser.urlencoded({ extended: false }));
      toExpressHandler(
        PaymentController.activatePaymentToPagoPa(
          config.PAGOPA,
          attivaRPTPagoPaClient
        )
      )(req, res);
    }
  );
  app.get(
    config.CONTROLLER.ROUTES.RESTFUL.PAYMENTS_ACTIVATION_CHECK,
    (req: express.Request, res: express.Response) => {
      logger.info("Serving Payment Check Activation Request (GET)...");
      app.use(bodyParser.json());
      app.use(bodyParser.urlencoded({ extended: false }));
      toExpressHandler(
        PaymentController.checkPaymentActivationStatusFromDB(redisClient)
      )(req, res);
    }
  );
}
// Create Soap services for PagoPA (cdInfoDatiPagamento)
function setSoapServices(
  app: core.Express,
  redisClient: redis.RedisClient,
  statusTimeout: RedisTimeout
): void {
  const wsdl = fs.readFileSync(`${__dirname}${cdPerNodoWsdl}`, "UTF-8");
  const service = {
    FespCdService: {
      FespCdPortType: {
        cdInfoPagamento: (
          input: IcdInfoPagamentoInput,
          callback: () => void
        ): void => {
          PaymentController.updatePaymentActivationStatusIntoDB(
            input,
            statusTimeout,
            redisClient,
            callback
          );
        }
      }
    }
  };

  soap.listen(
    app,
    CONFIG.CONTROLLER.ROUTES.SOAP.PAYMENTS_ACTIVATION_STATUS_UPDATE,
    service,
    wsdl
  );
}
