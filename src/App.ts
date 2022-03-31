/* eslint-disable prefer-arrow/prefer-arrow-functions */
/**
 * App
 * Define a Restful and a SOAP Webservice and routes incoming requests to controllers
 */

import * as http from "http";
import * as appInsights from "applicationinsights";
import * as bodyParser from "body-parser";
import * as express from "express";
import * as core from "express-serve-static-core";
import { toExpressHandler } from "@pagopa/ts-commons/lib/express";
import * as morgan from "morgan";
import * as redis from "redis";
import RedisClustr = require("redis-clustr");
import * as soap from "soap";

// import { specs as publicApiV1Specs } from "../generated/api/public_api_pagopa";
import { Configuration } from "./Configuration";
import * as PaymentController from "./controllers/restful/PaymentController";
import { requireClientCertificateFingerprint } from "./middlewares/requireClientCertificateFingerprint";
import * as FespCdServer from "./services/pagopa_api/FespCdServer";
import * as NodoNM3PortClient from "./services/pagopa_api/NodoNM3PortClient";
import * as PPTPortClient from "./services/pagopa_api/PPTPortClient";
import {
  EventNameEnum,
  EventResultEnum,
  trackPaymentEvent
} from "./utils/AIUtils";

import { logger } from "./utils/Logger";

/**
 * Define a Service Handler for FespCdService SOAP service
 * It's an endpoint for PagoPA to confirm a payment activation result
 *
 * @param {redis.RedisClient} redisClient - Redis Client to store persistente paymentId into DB
 * @param {number} redisTimeoutSecs - Timeout set for information stored into DB
 * @return {IFespCdPortTypeSoap} An object containing the service handler
 */
const getFespCdServiceHandler = (
  redisClient: redis.RedisClient,
  redisTimeoutSecs: number
): soap.IServicePort => ({
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  cdInfoWisp: (input, cb) => {
    logger.info(
      `idpayment=${input.idPagamento}|contesto=${input.codiceContestoPagamento}|dominio=${input.identificativoDominio}|versamento=${input.identificativoUnivocoVersamento}`
    );
    const aiEventProps = {
      ccp: input.codiceContestoPagamento,
      iddominio: input.identificativoDominio,
      idpayment: input.idPagamento,
      iuv: input.identificativoUnivocoVersamento
    };
    PaymentController.setActivationStatus(
      input,
      redisTimeoutSecs,
      redisClient
    ).then(
      iCdInfoWispOutput => {
        appInsights.defaultClient.trackEvent({
          name: "CDINFO_COMPLETE",
          properties: aiEventProps
        });
        if (cb) {
          // we need to cast the callback to any as the type definition doesn't
          // include all the actual parameters
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (cb as any)(undefined, iCdInfoWispOutput);
        }
      },
      err => {
        logger.error(`Error on setActivationStatus: ${err}`);
        appInsights.defaultClient.trackEvent({
          name: "CDINFO_ERROR",
          properties: aiEventProps
        });
        if (cb) {
          // we need to cast the callback to any as the type definition doesn't
          // include all the actual parameters
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (cb as any)(undefined, { esito: "KO" });
        }
      }
    );
  }
});

/**
 * Define and start an express Server
 * to expose RESTful and SOAP endpoints for BackendApp and Proxy requests.
 *
 * @param {Configuration} config - The server configuration to use
 * @return {Promise<http.Server>} The express server defined and started
 */
export async function startApp(config: Configuration): Promise<http.Server> {
  logger.info("Starting Proxy PagoPA Server...");

  // Define SOAP Clients for PagoPA SOAP WS
  // It is necessary to forward BackendApp requests to PagoPA
  const pagoPAClient = new PPTPortClient.PagamentiTelematiciPspNodoAsyncClient(
    await PPTPortClient.createPagamentiTelematiciPspNodoClient(
      {
        endpoint: `${config.PAGOPA.HOST}:${config.PAGOPA.PORT}${config.PAGOPA.WS_SERVICES.PAGAMENTI.NODO_PER_PSP}`
      },
      config.PAGOPA.CERT,
      config.PAGOPA.KEY,
      config.PAGOPA.HOST_HEADER
    ),
    config.PAGOPA.CLIENT_TIMEOUT_MSEC
  );

  const pagoPANm3PspClient = new NodoNM3PortClient.PagamentiTelematiciPspNm3NodoAsyncClient(
    await NodoNM3PortClient.createNm3NodoPspClient(
      {
        endpoint: `${config.PAGOPA.HOST}:${config.PAGOPA.PORT}${config.PAGOPA.WS_SERVICES.PAGAMENTI.NODE_FOR_PSP}`
      },
      config.PAGOPA.CERT,
      config.PAGOPA.KEY,
      config.PAGOPA.HOST_HEADER
    ),
    config.PAGOPA.CLIENT_TIMEOUT_MSEC
  );

  const pagoPANm3IoClient = new NodoNM3PortClient.PagamentiTelematiciPspNm3NodoAsyncClient(
    await NodoNM3PortClient.createNm3NodoIoClient(
      {
        endpoint: `${config.PAGOPA.HOST}:${config.PAGOPA.PORT}${config.PAGOPA.WS_SERVICES.PAGAMENTI.NODE_FOR_IO}`
      },
      config.PAGOPA.CERT,
      config.PAGOPA.KEY,
      config.PAGOPA.HOST_HEADER
    ),
    config.PAGOPA.CLIENT_TIMEOUT_MSEC
  );

  // Define a redis client necessary to handle persistent data
  // for async payment activation process
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const redisClient = getRedisClient(config);

  // Define RESTful endpoints
  const app = express();
  app.set("port", config.CONTROLLER.PORT);
  const loggerFormat =
    ":date[iso] [info]: :method :url :status - :response-time ms";
  app.use(morgan(loggerFormat));

  const clientCertificateFingerprint =
    config.CONTROLLER.CLIENT_CERTIFICATE_FINGERPRINT;
  // Verify client certificate fingerprint if required
  if (clientCertificateFingerprint !== undefined) {
    app.use(requireClientCertificateFingerprint(clientCertificateFingerprint));
  }

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  setRestfulRoutes(
    app,
    config,
    redisClient,
    pagoPAClient,
    pagoPANm3PspClient,
    pagoPANm3IoClient
  );

  // Define SOAP endpoints
  const fespCdServiceHandler = getFespCdServiceHandler(
    redisClient,
    config.PAYMENT_ACTIVATION_STATUS_TIMEOUT_SECONDS
  );
  await FespCdServer.attachFespCdServer(
    app,
    config.CONTROLLER.ROUTES.SOAP.PAYMENT_ACTIVATIONS_STATUS_UPDATE,
    fespCdServiceHandler
  );

  const server = http.createServer(app);
  server.listen(config.CONTROLLER.PORT);

  logger.info(
    `Server started at ${config.CONTROLLER.HOST}:${config.CONTROLLER.PORT}`
  );
  return server;
}

export function stopServer(server: http.Server): void {
  logger.info("Stopping Proxy PagoPA Server...");
  server.close();
}

/**
 * Set RESTful WS endpoints
 *
 * @param {core.Express} app - Express server to set
 * @param {Configuration} config - PagoPa proxy configuration
 * @param {redis.RedisClient} redisClient - The redis client used to store information sent by PagoPA
 * @param {PagamentiTelematiciPspNodoAsyncClient} pagoPAClient - PagoPa SOAP client to call verificaRPT and attivaRPT services
 */
// eslint-disable-next-line max-params
function setRestfulRoutes(
  app: core.Express,
  config: Configuration,
  redisClient: redis.RedisClient,
  pagoPAClient: PPTPortClient.PagamentiTelematiciPspNodoAsyncClient,
  pagoPAClientPspNm3: NodoNM3PortClient.PagamentiTelematiciPspNm3NodoAsyncClient,
  pagoPAClientIoNm3: NodoNM3PortClient.PagamentiTelematiciPspNm3NodoAsyncClient
): void {
  const jsonParser = bodyParser.json();

  // fase 1 (verifica) : payment-requests > nodoVerificaRPT(NodoPerPsp) OR verifyPaymentNotice(nodeForPsp)
  const getPaymentInfoHandler = toExpressHandler(
    PaymentController.getPaymentInfo(
      config.PAGOPA,
      pagoPAClient,
      pagoPAClientPspNm3
    )
  );
  app.get(
    config.CONTROLLER.ROUTES.RESTFUL.PAYMENT_REQUESTS_GET,
    getPaymentInfoHandler
  );

  // fase 2 (attiva) : payment-activations > nodoAttivaRpt(NodoPerPsp) OR activateIOPayment(nodeForIO)
  const activatePaymentHandler = toExpressHandler(
    PaymentController.activatePayment(
      config.PAGOPA,
      pagoPAClient,
      pagoPAClientIoNm3,
      redisClient,
      config.PAYMENT_ACTIVATION_STATUS_TIMEOUT_SECONDS
    )
  );
  app.post(
    config.CONTROLLER.ROUTES.RESTFUL.PAYMENT_ACTIVATIONS_POST,
    jsonParser,
    activatePaymentHandler
  );

  // fase 3 - getPayment ( polling )
  const getActivationStatusHandler = toExpressHandler(
    PaymentController.getActivationStatus(redisClient)
  );
  app.get(
    config.CONTROLLER.ROUTES.RESTFUL.PAYMENT_ACTIVATIONS_GET,
    getActivationStatusHandler
  );

  // Endpoint for OpenAPI handler
  // eslint-disable-next-line extra-rules/no-commented-out-code
  // app.get("/api/v1/swagger.json", GetOpenapi(publicApiV1Specs));

  // Liveness probe for Kubernetes.
  // @see
  // https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-probes/#define-a-liveness-http-request
  app.get("/ping", (_, res) => res.status(200).send("ok"));

  app.get("/", (_, res) => res.status(200).send());
}

/**
 * Define a redis client necessary to handle persistent data
 *
 * @param {Configuration} config - Server Configuration
 * @return {(app: core.Express) => soap.Server} A method to execute for start server listening
 */
function getRedisClient(config: Configuration): redis.RedisClient {
  const redisClient = ((): redis.RedisClient => {
    if (config.REDIS_DB.USE_CLUSTER) {
      logger.debug("Creating a REDIS client using cluster...");
      return new RedisClustr({
        redisOptions: {
          password: config.REDIS_DB.PASSWORD,
          tls: {
            servername: config.REDIS_DB.HOST
          }
        },
        servers: [
          {
            host: config.REDIS_DB.HOST,
            port: config.REDIS_DB.PORT
          }
        ]
      }) as redis.RedisClient;
    }
    logger.debug("Creating a REDIS client...");

    // eslint-disable-next-line functional/no-let
    let tlsConfig = {};
    if (config.REDIS_DB.PASSWORD !== undefined) {
      tlsConfig = {
        tls: {
          servername: config.REDIS_DB.HOST
        }
      };
    } else {
      logger.debug("REDIS_DB.PASSWORD not set, TLS is disabled.");
    }

    return redis.createClient({
      password: config.REDIS_DB.PASSWORD,
      port: config.REDIS_DB.PORT,
      url: config.REDIS_DB.HOST,
      ...tlsConfig
    });
  })();

  redisClient.on("error", err => {
    logger.error(`REDIS Connection error: ${err}`);
    trackPaymentEvent({
      name: EventNameEnum.REDIS_ERROR,
      properties: {
        result: EventResultEnum.REDIS_CONNECTION_ERR
      }
    });
  });
  redisClient.on("reconnecting", () => {
    logger.info(`REDIS is trying to reconnect...`);
    trackPaymentEvent({
      name: EventNameEnum.REDIS_ERROR,
      properties: {
        result: EventResultEnum.REDIS_TRY_RECONNECT
      }
    });
  });
  redisClient.on("warning", err => {
    logger.warn(`REDIS Connection warning: ${err}`);
    trackPaymentEvent({
      name: EventNameEnum.REDIS_ERROR,
      properties: {
        result: EventResultEnum.REDIS_CONNECTION_WRN
      }
    });
  });
  redisClient.on("end", () => {
    logger.error(`REDIS Connection lost`);
    trackPaymentEvent({
      name: EventNameEnum.REDIS_ERROR,
      properties: {
        result: EventResultEnum.REDIS_CONNECTION_LOST
      }
    });
  });

  return redisClient;
}
