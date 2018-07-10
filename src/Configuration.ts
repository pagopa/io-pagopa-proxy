/**
 * Common configurations for Proxy PagoPA and external resources
 */

import * as t from "io-ts";
import { WithinRangeNumber } from "italia-ts-commons/lib/numbers";
import { NonEmptyString } from "italia-ts-commons/lib/strings";

const localhost = "http://localhost";

export const CONFIG = {
  // The log level used for Winston logger (error, info, debug)
  WINSTON_LOG_LEVEL: process.env.WINSTON_LOG_LEVEL || "debug",

  // RESTful Webservice configuration
  // These information are documented here:
  // https://docs.google.com/document/d/1Qqe6mSfon-blHzc-ldeEHmzIkVaElKY5LtDnKiLbk80/edit
  // Used to expose services
  CONTROLLER: {
    PORT: process.env.PAGOPAPROXY_PORT || 3000,
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
    PORT: process.env.PAGOPA_PORT || 3001,
    WS_SERVICES: {
      PAGAMENTI: "/PagamentiTelematiciPspNodoservice/"
    },
    // These information will identify our system when it will access to PagoPA
    IDENTIFIER: {
      IDENTIFICATIVO_PSP: "AGID_01",
      IDENTIFICATIVO_INTERMEDIARIO_PSP: "97735020584",
      IDENTIFICATIVO_CANALE: "97735020584_02",
      PASSWORD: process.env.PAGOPA_PASSWORD || "ND"
    }
  },

  // Redis DB Server Configuration
  REDIS_DB: {
    PORT: process.env.REDIS_DB_PORT || 6379,
    HOST: process.env.REDIS_DB_URL || "redis://localhost",
    PASSWORD: process.env.REDIS_DB_PASSWORD || "ND",
    USE_CLUSTER: process.env.REDIS_USE_CLUSTER || false
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

const PagoPAConfig = t.intersection([
  ServerConfiguration,
  t.interface({
    WS_SERVICES: t.interface({
      PAGAMENTI: NonEmptyString
    }),
    IDENTIFIER: t.interface({
      IDENTIFICATIVO_PSP: NonEmptyString,
      IDENTIFICATIVO_INTERMEDIARIO_PSP: NonEmptyString,
      IDENTIFICATIVO_CANALE: NonEmptyString,
      TOKEN: NonEmptyString
    })
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
