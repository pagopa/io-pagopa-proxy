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
      PAYMENTS_CHECK: "/payment/check",
      PAYMENTS_ACTIVATION: "/payment/activation"
    }
  },

  // PagoPa SOAP Configuration
  PAGOPA: {
    HOST: process.env.PAGOPAAPI_HOST || localhost,
    PORT: process.env.PAGOPAAPI_PORT || 3001,
    SERVICES: {},
    IDENTIFIER: {
      IDENTIFICATIVO_PSP: "AGID_01",
      IDENTIFICATIVO_INTERMEDIARIO_PSP: "97735020584",
      IDENTIFICATIVO_CANALE: "97735020584_02",
      TOKEN: "ND"
    },
    PAYMENTS: {
      CODIFICA_INFRASTRUTTURA_PSP: "QR-CODE",
      TIPO_IDENTIFICATIVO_UNIVOCO_PERSONA_G: "G"
    }
  },

  // CdAvvisi API Configuration
  CDAVVISI_API: {
    HOST: process.env.CDBACKEND_HOST || localhost,
    PORT: process.env.CDBACKEND_PORT || 3002,
    SERVICES: {
      PAYMENTS_STATUS_UPDATE: "/payment/status/update"
    }
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
      PAYMENTS_CHECK: NonEmptyString,
      PAYMENTS_ACTIVATION: NonEmptyString
    })
  })
]);
export type ControllerConfig = t.TypeOf<typeof ControllerConfig>;

const CDAvvisiConfig = t.intersection([
  ServerConfiguration,
  t.interface({
    SERVICES: t.interface({
      PAYMENTS_STATUS_UPDATE: NonEmptyString
    })
  })
]);
export type CDAvvisiConfig = t.TypeOf<typeof CDAvvisiConfig>;

const PagoPaConfig = t.intersection([
  ServerConfiguration,
  t.interface({
    SERVICES: t.interface({}),
    IDENTIFIER: t.interface({
      IDENTIFICATIVO_PSP: NonEmptyString,
      IDENTIFICATIVO_INTERMEDIARIO_PSP: NonEmptyString,
      IDENTIFICATIVO_CANALE: NonEmptyString,
      TOKEN: NonEmptyString
    }),
    PAYMENTS: t.interface({
      CODIFICA_INFRASTRUTTURA_PSP: NonEmptyString,
      TIPO_IDENTIFICATIVO_UNIVOCO_PERSONA_G: NonEmptyString
    })
  })
]);

export type PagoPaConfig = t.TypeOf<typeof PagoPaConfig>;

export const Configuration = t.interface({
  CONTROLLER: ControllerConfig,
  CDAVVISI_API: CDAvvisiConfig,
  PAGOPA: PagoPaConfig
});
export type Configuration = t.TypeOf<typeof Configuration>;
