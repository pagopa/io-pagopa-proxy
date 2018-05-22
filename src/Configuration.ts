/**
 * Common configurations
 */

import * as t from "io-ts";
import { WithinRangeNumber } from "italia-ts-commons/lib/numbers";
import { NonEmptyString } from "italia-ts-commons/lib/strings";
import { logger } from "./utils/Logger";

const CONFIG = {
  // PagoPa-Proxy Configuration
  CONTROLLER: {
    PORT: process.env.PAGOPAPROXY_PORT || 3000,
    HOST: process.env.PAGOPAPROXY_HOST || "http://localhost",
    ROUTES: {
      NOTIFICATION_ACTIVATION:
        "/notifications/subscription/:fiscalCode/activation",
      NOTIFICATION_DEACTIVATION:
        "/notifications/subscription/:fiscalCode/deactivation"
    }
  },

  // PagoPa Restful Configuration
  PAGOPA: {
    HOST: process.env.PAGOPAAPI_HOST || "http://localhost",
    PORT: process.env.PAGOPAAPI_PORT || 3001,
    SERVICES: {
      NOTIFICATION_UPDATE_SUBSCRIPTION: "/notifications/subscription/update"
    }
  }
};

// Configuration validator
const PagoPaConfig = t.interface({
  PORT: WithinRangeNumber(0, 65535),
  HOST: NonEmptyString,
  SERVICES: t.interface({
    NOTIFICATION_UPDATE_SUBSCRIPTION: NonEmptyString
  })
});
export type PagoPaConfig = t.TypeOf<typeof PagoPaConfig>;

const Configuration = t.interface({
  CONTROLLER: t.interface({
    PORT: WithinRangeNumber(0, 65535),
    HOST: NonEmptyString,
    ROUTES: t.interface({
      NOTIFICATION_ACTIVATION: NonEmptyString,
      NOTIFICATION_DEACTIVATION: NonEmptyString
    })
  }),
  PAGOPA: PagoPaConfig
});

export type Configuration = t.TypeOf<typeof Configuration>;
export function GET_CONFIG(): Configuration {
  const configDecode = Configuration.decode(CONFIG);
  if (configDecode.isLeft()) {
    const error = "Invalid Configuration! Please check it!";
    logger.error(error);
    throw Error(error);
  }
  return configDecode.value;
}
