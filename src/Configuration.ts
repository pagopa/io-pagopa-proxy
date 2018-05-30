/**
 * Common configurations
 */

import * as t from "io-ts";
import { WithinRangeNumber } from "italia-ts-commons/lib/numbers";
import { NonEmptyString } from "italia-ts-commons/lib/strings";

const localhost = "http://localhost";

// Controller Configuration for REST Webservice
export const CONFIG = {
  CONTROLLER: {
    PORT: process.env.PAGOPAPROXY_PORT || 3000,
    HOST: process.env.PAGOPAPROXY_HOST || localhost,
    ROUTES: {
      NOTIFICATIONS_ACTIVATION:
        "/notifications/subscription/:fiscalCode/activation",
      NOTIFICATIONS_DEACTIVATION:
        "/notifications/subscription/:fiscalCode/deactivation",
      NOTIFICATIONS_DISPATCHER: "/notifications/dispatcher",
      PAYMENTS_CHECK: "/payment/check",
      PAYMENTS_ACTIVATION: "/payment/activation",
      PAYMENTS_STATUS_UPDATE: "/payment/status/update"
    }
  },

  // PagoPa API Configuration
  PAGOPA_API: {
    HOST: process.env.PAGOPAAPI_HOST || localhost,
    PORT: process.env.PAGOPAAPI_PORT || 3001,
    SERVICES: {
      NOTIFICATIONS_UPDATEPAGOPA_API_SUBSCRIPTION:
        "/notifications/subscription/update"
    },
    IDENTIFIER: {
      IDENTIFICATIVO_PSP: "AGID_01",
      IDENTIFICATIVO_INTERMEDIARIO_PSP: "97735020584",
      IDENTIFICATIVO_CANALE: "97735020584_02",
      TOKEN: "ND"
    },
    DATI_NOTIFICA: {
      DATA_ORA_RICHIESTA: String(new Date().toISOString().slice(0, 19)),
      IDENTIFICATIVO_MESSAGGIO_RICHIESTA: String(
        Math.random()
          .toString(36)
          .substring(2, 15) +
          Math.random()
            .toString(36)
            .substring(2, 15)
      ) //tslint:disable-line
    }
  },

  // CdAvvisi API Configuration
  CDAVVISI_API: {
    HOST: process.env.CDBACKEND_HOST || localhost,
    PORT: process.env.CDBACKEND_PORT || 3002,
    SERVICES: {}
  }
};

// Configuration validator - Define configuration structure for decoder
const ServerConfiguration = t.interface({
  PORT: WithinRangeNumber(0, 65535),
  HOST: NonEmptyString
});
export type ServerConfiguration = t.TypeOf<typeof ServerConfiguration>;

const ControllerConfig = t.intersection([
  ServerConfiguration,
  t.interface({
    ROUTES: t.interface({
      NOTIFICATIONS_ACTIVATION: NonEmptyString,
      NOTIFICATIONS_DEACTIVATION: NonEmptyString,
      NOTIFICATIONS_DISPATCHER: NonEmptyString,
      PAYMENTS_CHECK: NonEmptyString,
      PAYMENTS_ACTIVATION: NonEmptyString,
      PAYMENTS_STATUS_UPDATE: NonEmptyString
    })
  })
]);
export type ControllerConfig = t.TypeOf<typeof ControllerConfig>;

const PagoPaConfig = t.intersection([
  ServerConfiguration,
  t.interface({
    SERVICES: t.interface({
      NOTIFICATIONS_UPDATE_SUBSCRIPTION: NonEmptyString
    })
  })
]);
export type PagoPaConfig = t.TypeOf<typeof PagoPaConfig>;

const CDAvvisiConfig = t.intersection([
  ServerConfiguration,
  t.interface({
    SERVICES: t.interface({}),
    IDENTIFIER: t.interface({
      IDENTIFICATIVO_PSP: NonEmptyString,
      IDENTIFICATIVO_INTERMEDIARIO_PSP: NonEmptyString,
      IDENTIFICATIVO_CANALE: NonEmptyString,
      TOKEN: NonEmptyString,
      TIPO_IDENTIFICATIVO_UNIVOCO: NonEmptyString
    }),
    DATI_NOTIFICA: t.interface({
      DATA_ORA_RICHIESTA: NonEmptyString,
      IDENTIFICATIVO_MESSAGGIO_RICHIESTA: NonEmptyString
    })
  })
]);
export type CDAvvisiConfig = t.TypeOf<typeof CDAvvisiConfig>;

export const Configuration = t.interface({
  CONTROLLER: ControllerConfig,
  PAGOPA_API: PagoPaConfig,
  CDAVVISI_API: CDAvvisiConfig
});
export type Configuration = t.TypeOf<typeof Configuration>;
