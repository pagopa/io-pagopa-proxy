/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 */

import * as express from "express";
import fetch from "node-fetch";
import querystring = require("querystring");
import { CONFIG } from "../../Configuration";
import { ITransactionListResponse } from "../types/TransactionResponse";

// Transaction Service for PagoPA communications
export class TransactionAPI {
  // Retrieve transactions
  public static getTransactionListResponse(
    res: express.Response,
    errorCallback: (response: express.Response, errorMsg: string) => void,
    successCallback: (
      response: express.Response,
      transactionList: ITransactionListResponse
    ) => void,
    apiRequestToken: string,
    id?: number,
    start?: number,
    size?: number
  ): void {
    let url; // tslint:disable-line
    if (id !== undefined) {
      url =
        CONFIG.PAGOPA.HOST +
        ":" +
        String(CONFIG.PAGOPA.PORT) +
        CONFIG.PAGOPA.SERVICES.TRANSACTION.replace(":id", String(id)) + "?" + querystring.stringify({
          apiRequestToken
        });
    } else {
      url =
        CONFIG.PAGOPA.HOST +
        ":" +
        String(CONFIG.PAGOPA.PORT) +
        CONFIG.PAGOPA.SERVICES.TRANSACTIONS + "?" + querystring.stringify({
          apiRequestToken,
          start: String(start),
          size: String(size)
        });
    }

    fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    })
      .then(fetchRes => fetchRes.json())
      .then(json => successCallback(res, json))
      .catch(err => errorCallback(res, err));
  }
}
