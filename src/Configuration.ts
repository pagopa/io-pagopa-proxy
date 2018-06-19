/**
 * Common configurations for Proxy PagoPA and external resources
 */

import * as t from "io-ts";
import { WithinRangeNumber } from "italia-ts-commons/lib/numbers";
import { NonEmptyString } from "italia-ts-commons/lib/strings";

// Localhost hostname used for debugging
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

  // PagoPA Configuration
  // Ask the pagopa service administrator.
  // These values are the same for test and production environment
  // Used to communicate with PagoPA
  PAGOPA: {
    HOST: process.env.PAGOPA_HOST || localhost,
    PORT: process.env.PAGOPA_PORT || 3001,
    SERVICES: {
      PAYMENTS_CHECK: "nodoVerificaRPT",
      PAYMENTS_ACTIVATION: "nodoAttivaRPT"
    },
    // These information will identify our system when it will access to PagoPA
    IDENTIFIER: {
      IDENTIFICATIVO_PSP: "AGID_01",
      IDENTIFICATIVO_INTERMEDIARIO_PSP: "97735020584",
      IDENTIFICATIVO_CANALE: "97735020584_02",
      TOKEN: process.env.PAGOPA_TOKEN || "ND"
    }
  },

  // Redis DB Server Configuration
  REDIS_DB: {
    PORT: process.env.REDIS_DB_PORT || 6379,
    HOST: process.env.REDIS_DB_HOST || "localhost"
  },

  // Timeout used to store PaymentId into redis db (AttivaRPT process)
  // #158387557 The value is an estimation that could be reviewed with real scenarios
  PAYMENT_ACTIVATION_STATUS_TIMEOUT: 60 * 60 * 48
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
        PAYMENTS_ACTIVATION_STATUS_UPDATE: NonEmptyString
      })
    })
  })
]);
export type ControllerConfig = t.TypeOf<typeof ControllerConfig>;

const PagoPAConfig = t.intersection([
  ServerConfiguration,
  t.interface({
    SERVICES: t.interface({
      PAYMENTS_CHECK: NonEmptyString,
      PAYMENTS_ACTIVATION: NonEmptyString
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

export const Configuration = t.interface({
  WINSTON_LOG_LEVEL: WinstonLogLevel,
  CONTROLLER: ControllerConfig,
  PAGOPA: PagoPAConfig,
  PAYMENT_ACTIVATION_STATUS_TIMEOUT: t.number,
  REDIS_DB: ServerConfiguration
});
export type Configuration = t.TypeOf<typeof Configuration>;
