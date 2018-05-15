/**
 * Tests for Transactions Controllers
 * Send HTTP requests to Transaction Controllers and check mocked responses
 */

import * as express from "express";
import { TransactionAPI } from "../api/services/TransactionAPI";
import { ITransactionListResponse } from "../api/types/TransactionResponse";
import { AppResponseConverter } from "../utils/AppResponseConverter";
import { RestfulUtils } from "../utils/RestfulUtils";

// Transaction Controller
export class TransactionController {
  // Retrieve user transactions
  public static getTransactions(
    req: express.Request,
    res: express.Response
  ): void {
    // Check user session
    if (!RestfulUtils.checkTokenIntoRequest(req, res)) {
      return;
    }

    TransactionAPI.getTransactionListResponse(
      res,
      RestfulUtils.handleErrorCallback,
      (
        response: express.Response,
        transactionListResponse: ITransactionListResponse
      ) => {
        // Success callback
        RestfulUtils.setSuccessResponse(
          response,
          AppResponseConverter.getTransactionListFromAPIResponse(
            transactionListResponse
          )
        );
      },
      req.query.apiRequestToken,
      req.params.id,
      req.query.start,
      req.query.size
    );
  }
}
