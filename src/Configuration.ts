/* eslint-disable sort-keys */
/**
 * Common configurations for Proxy PagoPA and external resources
 */

import * as t from "io-ts";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { enumType } from "@pagopa/ts-commons/lib/types";
import { stText35_type_ppt } from "../generated/PagamentiTelematiciPspNodoservice/stText35_type_ppt";
import { stPassword_type_ppt } from "../generated/PagamentiTelematiciPspNodoservice/stPassword_type_ppt";

const localhost = "http://localhost";

export const CONFIG = {
  APPINSIGHTS_INSTRUMENTATIONKEY:
    process.env.APPINSIGHTS_INSTRUMENTATIONKEY || "key",
  APPINSIGHTS_DISABLE: process.env.APPINSIGHTS_DISABLE || "false",
  APPINSIGHTS_SAMPLING_PERCENTAGE:
    process.env.APPINSIGHTS_SAMPLING_PERCENTAGE || "100",
  // The log level used for Winston logger (error, info, debug)
  WINSTON_LOG_LEVEL: process.env.WINSTON_LOG_LEVEL || "debug",

  // RESTful Webservice configuration
  // These information are documented here:
  // https://docs.google.com/document/d/1Qqe6mSfon-blHzc-ldeEHmzIkVaElKY5LtDnKiLbk80/edit
  // Used to expose services
  CONTROLLER: {
    HOST: process.env.PAGOPAPROXY_HOST || localhost,
    PORT: process.env.PAGOPAPROXY_PORT || process.env.PORT || 3000,
    // SHA256 client certificate fingerprint (without `:` separators)
    CLIENT_CERTIFICATE_FINGERPRINT:
      process.env.PAGOPAPROXY_CLIENT_CERTIFICATE_FINGERPRINT,
    ROUTES: {
      RESTFUL: {
        PAYMENT_ACTIVATIONS_GET:
          "/payment-activations/:codiceContestoPagamento",
        PAYMENT_ACTIVATIONS_POST: "/payment-activations",
        PAYMENT_REQUESTS_GET: "/payment-requests/:rpt_id_from_string"
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
    CLIENT_TIMEOUT_MSEC: Number(process.env.PAGOPA_TIMEOUT_MSEC) || 10000,
    HOST: process.env.PAGOPA_HOST || localhost,
    HOST_HEADER: process.env.PAGOPA_HOST_HEADER,
    CERT: process.env.PAGOPA_CERT,
    KEY: process.env.PAGOPA_KEY,
    // These information will identify our system when it will access to PagoPA
    IDENTIFIERS: JSON.parse(process.env.NODE_CONNECTIONS_CONFIG || "{}"),
    PORT: process.env.PAGOPA_PORT || 3001,
    WS_SERVICES: {
      PAGAMENTI: {
        NODO_PER_PSP:
          process.env.PAGOPA_WS_NODO_PER_PSP_URI || "/api/nodo-per-psp/v1",
        NODE_FOR_PSP:
          process.env.PAGOPA_WS_NODE_FOR_PSP_URI || "/api/node-for-psp/v1",
        NODE_FOR_IO:
          process.env.PAGOPA_WS_NODE_FOR_IO_URI || "/api/node-for-io/v1"
      }
    },
    NM3_ENABLED: pipe(
      O.fromNullable(process.env.NM3_ENABLED),
      O.map(_ => _.toLowerCase() === "true"),
      O.getOrElse(() => false)
    )
  },

  // Redis DB Server Configuration
  REDIS_DB: {
    HOST: process.env.REDIS_DB_URL || "redis://localhost",
    PASSWORD: process.env.REDIS_DB_PASSWORD,
    PORT: process.env.REDIS_DB_PORT || 6379,
    USE_CLUSTER: pipe(
      O.fromNullable(process.env.REDIS_USE_CLUSTER),
      O.map(_ => _.toLowerCase() === "true"),
      O.getOrElse(() => false)
    )
  },

  // Timeout used to store PaymentId into redis db (AttivaRPT process)
  // #158387557 The value is an estimation that could be reviewed with real scenarios
  PAYMENT_ACTIVATION_STATUS_TIMEOUT_SECONDS: 60 * 60 * 48
};

// Configuration validator - Define configuration types and interfaces
const ServerConfiguration = t.interface({
  HOST: NonEmptyString,
  // We allow t.string to use socket pipe address in Azure App Services
  PORT: t.any
});
export type ServerConfiguration = t.TypeOf<typeof ServerConfiguration>;

const ControllerConfig = t.intersection([
  ServerConfiguration,
  t.interface({
    ROUTES: t.interface({
      RESTFUL: t.interface({
        PAYMENT_ACTIVATIONS_GET: NonEmptyString,
        PAYMENT_ACTIVATIONS_POST: NonEmptyString,
        PAYMENT_REQUESTS_GET: NonEmptyString
      }),
      SOAP: t.interface({
        PAYMENT_ACTIVATIONS_STATUS_UPDATE: NonEmptyString
      })
    })
  }),
  t.partial({
    CLIENT_CERTIFICATE_FINGERPRINT: NonEmptyString
  })
]);
export type ControllerConfig = t.TypeOf<typeof ControllerConfig>;

export const NodeClientConfig = t.interface({
  IDENTIFICATIVO_PSP: stText35_type_ppt,
  IDENTIFICATIVO_INTERMEDIARIO_PSP: stText35_type_ppt,
  IDENTIFICATIVO_CANALE: stText35_type_ppt,
  IDENTIFICATIVO_CANALE_PAGAMENTO: stText35_type_ppt,
  PASSWORD: stPassword_type_ppt
});
export type NodeClientConfig = t.TypeOf<typeof NodeClientConfig>;

export const NodeConnectionsConfig = t.interface({
  CLIENT_IO: NodeClientConfig,
  CLIENT_CHECKOUT: NodeClientConfig
});

export type NodeConnectionsConfig = t.TypeOf<typeof NodeConnectionsConfig>;

export enum NodeClientEnum {
  "CLIENT_IO" = "CLIENT_IO",
  "CLIENT_CHECKOUT" = "CLIENT_CHECKOUT"
}

export type NodeClientType = t.TypeOf<typeof NodeClientType>;
export const NodeClientType = enumType<NodeClientEnum>(
  NodeClientEnum,
  "NodeClientType"
);

export const PagoPAConfig = t.intersection([
  ServerConfiguration,
  t.interface({
    CLIENT_TIMEOUT_MSEC: t.number,
    IDENTIFIERS: NodeConnectionsConfig,
    WS_SERVICES: t.interface({
      PAGAMENTI: t.interface({
        NODO_PER_PSP: NonEmptyString,
        NODE_FOR_PSP: NonEmptyString,
        NODE_FOR_IO: NonEmptyString
      })
    }),
    NM3_ENABLED: t.boolean
  }),
  t.partial({
    CERT: NonEmptyString,
    KEY: NonEmptyString,
    HOST_HEADER: t.string
  })
]);
export type PagoPAConfig = t.TypeOf<typeof PagoPAConfig>;

export const WinstonLogLevel = t.keyof({
  debug: 4,
  error: 0,
  info: 2
});
export type WinstonLogLevel = t.TypeOf<typeof WinstonLogLevel>;

export const RedisConfig = t.intersection([
  ServerConfiguration,
  t.interface({
    USE_CLUSTER: t.boolean
  }),
  t.partial({
    PASSWORD: t.string
  })
]);
export type RedisConfig = t.TypeOf<typeof RedisConfig>;

export const Configuration = t.interface({
  CONTROLLER: ControllerConfig,
  PAGOPA: PagoPAConfig,
  PAYMENT_ACTIVATION_STATUS_TIMEOUT_SECONDS: t.number,
  REDIS_DB: RedisConfig,
  WINSTON_LOG_LEVEL: WinstonLogLevel
});
export type Configuration = t.TypeOf<typeof Configuration>;
