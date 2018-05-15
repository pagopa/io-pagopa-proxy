/**
 * WalletAPI Services
 * Provide services related to Wallet to communicate with PagoPaAPI
 */

import * as express from "express";
import fetch from "node-fetch";
import querystring = require("querystring");
import { CONFIG } from "../../Configuration";
import { WalletResponse } from "../types/WalletResponse";

// Wallet Service for PagoPA communications
export class WalletAPI {
  // Retrieve wallet containing payment methods
  public static getWalletResponse(
    res: express.Response,
    errorCallback: (res: express.Response, errorMsg: string) => void,
    successCallback: (
      res: express.Response,
      walletResponse: WalletResponse
    ) => void,
    apiRequestToken: string
  ): void {
    const url =
      CONFIG.PAGOPA.HOST +
      ":" +
      String(CONFIG.PAGOPA.PORT) +
      CONFIG.PAGOPA.SERVICES.WALLET;
    const queryParams = querystring.stringify({
      apiRequestToken
    });

    fetch(url + "?" + queryParams, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    })
      .then(fetchRes => fetchRes.json())
      .then(json => successCallback(res, json))
      .catch(err => errorCallback(res, err));
  }
}
