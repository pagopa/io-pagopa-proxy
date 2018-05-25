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
      PAYMENTS_STATUS_UPDATE: "/payment/status/update",
      RECEIPTS_DISPATCHER: "/receipts/dispatcher"
    }
  },

  // PagoPa API Configuration
  PAGOPA_API: {
    HOST: process.env.PAGOPAAPI_HOST || localhost,
    PORT: process.env.PAGOPAAPI_PORT || 3001,
    SERVICES: {
      NOTIFICATIONS_UPDATE_SUBSCRIPTION: "/notifications/subscription/update"
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
      PAYMENTS_STATUS_UPDATE: NonEmptyString,
      RECEIPTS_DISPATCHER: NonEmptyString
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
    SERVICES: t.interface({})
  })
]);
export type CDAvvisiConfig = t.TypeOf<typeof CDAvvisiConfig>;

export const Configuration = t.interface({
  CONTROLLER: ControllerConfig,
  PAGOPA_API: PagoPaConfig,
  CDAVVISI_API: CDAvvisiConfig
});
export type Configuration = t.TypeOf<typeof Configuration>;
