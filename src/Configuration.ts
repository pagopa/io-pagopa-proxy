/**
 * Common configurations for Proxy PagoPa and external resources
 */

import * as t from "io-ts";
import { WithinRangeNumber } from "italia-ts-commons/lib/numbers";
import { NonEmptyString } from "italia-ts-commons/lib/strings";

const localhost = "http://localhost";

export const cdPerNodoWsdl = "/wsdl/CdPerNodo.wsdl";

export const CONFIG = {
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
        PAYMENTS_CHECK: "/payment/check",
        PAYMENTS_ACTIVATION: "/payment/activation",
        PAYMENTS_ACTIVATION_CHECK:
          "/payment/activation/check/:codiceContestoPagamento"
      },
      SOAP: {
        PAYMENTS_ACTIVATION_STATUS_UPDATE: "/cdInfoPagamento"
      }
    }
  },

  // PagoPa Configuration
  // Ask the pagopa service administrator.
  // These values are the same for test and production environment
  // Used to communicate with PagoPa
  PAGOPA: {
    HOST: process.env.PAGOPA_HOST || localhost,
    PORT: process.env.PAGOPA_PORT || 3001,
    SERVICES: {
      PAYMENTS_CHECK: "nodoVerificaRPT",
      PAYMENTS_ACTIVATION: "nodoAttivaRPT"
    },
    // These information will identify our system when it will access to PagoPa
    IDENTIFIER: {
      IDENTIFICATIVO_PSP: "AGID_01",
      IDENTIFICATIVO_INTERMEDIARIO_PSP: "97735020584",
      IDENTIFICATIVO_CANALE: "97735020584_02",
      TOKEN: process.env.PAGOPA_TOKEN || "ND"
    }
  },

  // BackendApp Configuration
  // These information are documented here:
  // https://docs.google.com/document/d/1Qqe6mSfon-blHzc-ldeEHmzIkVaElKY5LtDnKiLbk80/edit
  // Used to communicate with Backend App
  BACKEND_APP: {
    HOST: process.env.BACKEND_APP_HOST || localhost,
    PORT: process.env.BACKEND_APP_PORT || 3002,
    SERVICES: {
      PAYMENTS_STATUS_UPDATE: "/payment/status/update"
    }
  },

  // Redis DB Configuration
  REDIS_DB: {
    PORT: process.env.REDIS_DB_PORT || 6379,
    HOST: process.env.REDIS_DB_HOST || "localhost"
  },

  // Timeout (seconds) for payment activation status expiration used for DB (1 HOUR - 5 DAYS)
  PAYMENT_ACTIVATION_STATUS_TIMEOUT: 60 * 60 * 24
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
        PAYMENTS_CHECK: NonEmptyString,
        PAYMENTS_ACTIVATION: NonEmptyString,
        PAYMENTS_ACTIVATION_CHECK: NonEmptyString
      }),
      SOAP: t.interface({
        PAYMENTS_STATUS_UPDATE: NonEmptyString
      })
    })
  })
]);
export type ControllerConfig = t.TypeOf<typeof ControllerConfig>;

const PagoPaConfig = t.intersection([
  ServerConfiguration,
  t.interface({
    SERVICES: t.interface({
      PAYMENTS_CHECK: NonEmptyString,
      PAYMENTS_ACTIVATION: NonEmptyString
    })
  }),
  t.interface({
    IDENTIFIER: t.interface({
      IDENTIFICATIVO_PSP: NonEmptyString,
      IDENTIFICATIVO_INTERMEDIARIO_PSP: NonEmptyString,
      IDENTIFICATIVO_CANALE: NonEmptyString,
      TOKEN: NonEmptyString
    })
  })
]);
export type PagoPaConfig = t.TypeOf<typeof PagoPaConfig>;

const BackendAppConfig = t.intersection([
  ServerConfiguration,
  t.interface({
    SERVICES: t.interface({
      PAYMENTS_STATUS_UPDATE: NonEmptyString
    })
  })
]);
export type BackendAppConfig = t.TypeOf<typeof BackendAppConfig>;

export const WinstonLogLevel = t.keyof({
  error: 0,
  warn: 1,
  info: 2,
  verbose: 3,
  debug: 4,
  silly: 5
});
export type WinstonLogLevel = t.TypeOf<typeof WinstonLogLevel>;

export const RedisTimeout = WithinRangeNumber(3600, 432000); // 1 HOUR - 5 DAYS
export type RedisTimeout = t.TypeOf<typeof RedisTimeout>;

export const Configuration = t.interface({
  WINSTON_LOG_LEVEL: WinstonLogLevel,
  CONTROLLER: ControllerConfig,
  PAGOPA: PagoPaConfig,
  BACKEND_APP: BackendAppConfig,
  PAYMENT_ACTIVATION_STATUS_TIMEOUT: RedisTimeout,
  REDIS_DB: ServerConfiguration
});
export type Configuration = t.TypeOf<typeof Configuration>;
