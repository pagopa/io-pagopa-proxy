/**
 * Common configurations
 */

export const CONFIG = {
  // PagoPa-Proxy Configuration
  CONTROLLER: {
    PORT: process.env.PAGOPAPROXY_PORT || 3000,
    HOST: process.env.PAGOPAPROXY_HOST || "http://localhost",
    ROUTES: {
      NOTIFICATION_ACTIVATION: (fiscalCode?: string): string => {
        if (fiscalCode === undefined) {
          return "/notifications/subscription/:fiscalCode/activation";
        }
        return "/notifications/subscription/" + fiscalCode + "/activation";
      },
      NOTIFICATION_DEACTIVATION: (fiscalCode?: string): string => {
        if (fiscalCode === undefined) {
          return "/notifications/subscription/:fiscalCode/deactivation";
        }
        return "/notifications/subscription/" + fiscalCode + "/deactivation";
      }
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
