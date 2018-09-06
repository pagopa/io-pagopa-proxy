/**
 * Common configurations for Proxy PagoPA and external resources
 */

import * as t from "io-ts";
import { WithinRangeNumber } from "italia-ts-commons/lib/numbers";
import { NonEmptyString } from "italia-ts-commons/lib/strings";
import { stPassword_ppt } from "./types/pagopa_api/yaml-to-ts/stPassword_ppt";
import { stText35_ppt } from "./types/pagopa_api/yaml-to-ts/stText35_ppt";

const localhost = "http://localhost";

export const CONFIG = {
  // The log level used for Winston logger (error, info, debug)
  WINSTON_LOG_LEVEL: process.env.WINSTON_LOG_LEVEL || "debug",

  // RESTful Webservice configuration
  // These information are documented here:
  // https://docs.google.com/document/d/1Qqe6mSfon-blHzc-ldeEHmzIkVaElKY5LtDnKiLbk80/edit
  // Used to expose services
  CONTROLLER: {
    PORT: Number(process.env.PAGOPAPROXY_PORT) || 3000,
    HOST: process.env.PAGOPAPROXY_HOST || localhost,
    ROUTES: {
      RESTFUL: {
        PAYMENT_REQUESTS_GET: "/payment-requests/:rptId",
        PAYMENT_ACTIVATIONS_POST: "/payment-activations",
        PAYMENT_ACTIVATIONS_GET: "/payment-activations/:codiceContestoPagamento"
      },
      SOAP: {
        PAYMENT_ACTIVATIONS_STATUS_UPDATE: "/FespCdService"
      }
    }
  },

  // PagoPA Configuration
  // Ask the pagopa service administrator.
  // These values are the same for test and production environment
  // Used to communicate with PagoPA
  PAGOPA: {
    HOST: process.env.PAGOPA_HOST || localhost,
    PORT: Number(process.env.PAGOPA_PORT) || 3001,
    HOST_HEADER: process.env.PAGOPA_HOST_HEADER,
    CLIENT_TIMEOUT_MSEC: Number(process.env.PAGOPA_TIMEOUT_MSEC) || 60000,
    WS_SERVICES: {
      PAGAMENTI:
        process.env.PAGOPA_WS_URI ||
        "/webservices/pof/PagamentiTelematiciPspNodoservice"
    },
    // These information will identify our system when it will access to PagoPA
    IDENTIFIER: {
      IDENTIFICATIVO_PSP: process.env.PAGOPA_ID_PSP,
      IDENTIFICATIVO_INTERMEDIARIO_PSP: process.env.PAGOPA_ID_INT_PSP,
      IDENTIFICATIVO_CANALE: process.env.PAGOPA_ID_CANALE,
      PASSWORD: process.env.PAGOPA_PASSWORD
    }
  },

  // Redis DB Server Configuration
  REDIS_DB: {
    PORT: Number(process.env.REDIS_DB_PORT) || 6379,
    HOST: process.env.REDIS_DB_URL || "redis://localhost",
    PASSWORD: process.env.REDIS_DB_PASSWORD || "ND",
    USE_CLUSTER: Boolean(process.env.REDIS_USE_CLUSTER) || false
  },

  // Timeout used to store PaymentId into redis db (AttivaRPT process)
  // #158387557 The value is an estimation that could be reviewed with real scenarios
  PAYMENT_ACTIVATION_STATUS_TIMEOUT_SECONDS: 60 * 60 * 48
};

// Configuration validator - Define configuration types and interfaces
const ServerConfiguration = t.interface({
  PORT: WithinRangeNumber(0, 65535),
  HOST: NonEmptyString
});
export type ServerConfiguration = t.TypeOf<typeof ServerConfiguration>;

const ControllerConfig = t.intersection([
  ServerConfiguration,
  t.interface({
    ROUTES: t.interface({
      RESTFUL: t.interface({
        PAYMENT_REQUESTS_GET: NonEmptyString,
        PAYMENT_ACTIVATIONS_POST: NonEmptyString,
        PAYMENT_ACTIVATIONS_GET: NonEmptyString
      }),
      SOAP: t.interface({
        PAYMENT_ACTIVATIONS_STATUS_UPDATE: NonEmptyString
      })
    })
  })
]);
export type ControllerConfig = t.TypeOf<typeof ControllerConfig>;

export const PagoPAConfig = t.intersection([
  ServerConfiguration,
  t.interface({
    CLIENT_TIMEOUT_MSEC: t.number,
    WS_SERVICES: t.interface({
      PAGAMENTI: NonEmptyString
    }),
    IDENTIFIER: t.interface({
      IDENTIFICATIVO_PSP: stText35_ppt,
      IDENTIFICATIVO_INTERMEDIARIO_PSP: stText35_ppt,
      IDENTIFICATIVO_CANALE: stText35_ppt,
      PASSWORD: stPassword_ppt
    })
  }),
  t.partial({
    HOST_HEADER: t.string
  })
]);
export type PagoPAConfig = t.TypeOf<typeof PagoPAConfig>;

export const WinstonLogLevel = t.keyof({
  error: 0,
  info: 2,
  debug: 4
});
export type WinstonLogLevel = t.TypeOf<typeof WinstonLogLevel>;

export const RedisConfig = t.intersection([
  ServerConfiguration,
  t.interface({
    PASSWORD: t.string,
    USE_CLUSTER: t.boolean
  })
]);
export type RedisConfig = t.TypeOf<typeof RedisConfig>;

export const Configuration = t.interface({
  WINSTON_LOG_LEVEL: WinstonLogLevel,
  CONTROLLER: ControllerConfig,
  PAGOPA: PagoPAConfig,
  PAYMENT_ACTIVATION_STATUS_TIMEOUT_SECONDS: t.number,
  REDIS_DB: RedisConfig
});
export type Configuration = t.TypeOf<typeof Configuration>;
