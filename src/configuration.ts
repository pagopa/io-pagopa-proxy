/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 */

// App configuration
export const CONFIG = {
  CONTROLLER: {
    PORT: 3000,
    MAPPING: {
      INDEX: "/",
      GET_WALLETS: "/getWallets",
      GET_CARDS: "/getCards",
      GET_TRANSACTIONS: "/getTransactions"
    }
  }
};
