/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 */

import * as express from "express";
import fetch from "node-fetch";
import querystring = require("querystring");
import { CONFIG } from "../../Configuration";
import { IRestfulObject } from "../../types/BaseResponseApp";
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
    start?: number,
    size?: number,
    id?: number
  ): void {
    let url; // tslint:disable-line
    if (id !== undefined) {
      url = CONFIG.PAGOPA.HOST + CONFIG.PAGOPA.SERVICES.TRANSACTION;
      url = url.replace(":id", String(id));
    } else {
      url = CONFIG.PAGOPA.HOST + CONFIG.PAGOPA.SERVICES.TRANSACTIONS;
      const queryParams: IRestfulObject = {
        apiRequestToken: { apiRequestToken },
        start: String(start),
        size: String(size)
      };
      url += querystring.stringify(queryParams);
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
