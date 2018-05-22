/**
 * Common configurations
 */

import * as t from "io-ts";
import { WithinRangeNumber } from "italia-ts-commons/lib/numbers";
import { NonEmptyString } from "italia-ts-commons/lib/strings";
import { logger } from "./utils/Logger";

const localhost = "http://localhost";

// Controller Configuration for REST Webservice
const CONFIG = {
  CONTROLLER: {
    PORT: process.env.PAGOPAPROXY_PORT || 3000,
    HOST: process.env.PAGOPAPROXY_HOST || localhost,
    ROUTES: {
      NOTIFICATION_ACTIVATION:
        "/notifications/subscription/:fiscalCode/activation",
      NOTIFICATION_DEACTIVATION:
        "/notifications/subscription/:fiscalCode/deactivation",
      PUT_NOTIFICATION: "/notifications"
    }
  },

  // PagoPa REST Webservices Configuration
  PAGOPA_API: {
    HOST: process.env.PAGOPAAPI_HOST || localhost,
    PORT: process.env.PAGOPAAPI_PORT || 3001,
    SERVICES: {
      NOTIFICATION_UPDATE_SUBSCRIPTION: "/notifications/subscription/update"
    }
  },

  // Backend REST Webservices Configuration
  CD_BACKEND: {
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
      NOTIFICATION_ACTIVATION: NonEmptyString,
      NOTIFICATION_DEACTIVATION: NonEmptyString,
      PUT_NOTIFICATION: NonEmptyString
    })
  })
]);
export type ControllerConfig = t.TypeOf<typeof ControllerConfig>;

const PagoPaConfig = t.intersection([
  ServerConfiguration,
  t.interface({
    SERVICES: t.interface({
      NOTIFICATION_UPDATE_SUBSCRIPTION: NonEmptyString
    })
  })
]);
export type PagoPaConfig = t.TypeOf<typeof PagoPaConfig>;

const CDBackendConfig = t.intersection([
  ServerConfiguration,
  t.interface({
    SERVICES: t.interface({})
  })
]);
export type CDBackendConfig = t.TypeOf<typeof CDBackendConfig>;

const Configuration = t.interface({
  CONTROLLER: ControllerConfig,
  PAGOPA_API: PagoPaConfig,
  CD_BACKEND: CDBackendConfig
});

// Provide a valid and typed Configuration
export type Configuration = t.TypeOf<typeof Configuration>;
export function GET_CONFIG(): Configuration {
  const errorOrConfig = Configuration.decode(CONFIG);
  if (errorOrConfig.isLeft()) {
    const error = "Invalid Configuration! Please check it!";
    logger.error(error);
    throw Error(error);
  }
  return errorOrConfig.value;
}
