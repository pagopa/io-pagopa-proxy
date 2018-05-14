/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 */

// App configuration
export const CONFIG = {
  // PagoPa-Proxy Configuration
  CONTROLLER: {
    PORT: 3000,
    HOST: "http://localhost",
    ROUTES: {
      LOGIN: "/login/",
      LOGIN_ANONYMOUS: "/login/anonymous/",
      WALLET: "/wallet/",
      TRANSACTIONS: "/transactions/",
      TRANSACTION: "/transactions/:id/",
      NOTIFICATION_ACTIVATION:
        "/notifications/subscription/:fiscalCode/activation",
      NOTIFICATION_DEACTIVATION:
        "/notifications/subscription/:fiscalCode/deactivation"
    }
  },

  // PagoPa Restful Configuration
  PAGOPA: {
    HOST: "http://localhost",
    PORT: 3001,
    SERVICES: {
      LOGIN: "/login/",
      LOGIN_ANONYMOUS: "/loginAnonymous/",
      WALLET: "/wallet/",
      TRANSACTIONS: "/transactions/",
      TRANSACTION: "/transactions/:id/",
      NOTIFICATION_UPDATE_SUBSCRIPTION: "/notifications/subscription/update"
    }
  }
};
