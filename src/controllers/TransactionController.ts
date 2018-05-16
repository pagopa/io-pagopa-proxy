/**
 * Tests for Transactions Controllers
 * Send HTTP requests to Transaction Controllers and check mocked responses
 */

import * as express from "express";
import { TransactionAPI } from "../api/services/TransactionAPI";
import { TransactionListResponse } from "../api/types/TransactionResponse";
import { HttpErrorStatusCode } from "../enums/HttpErrorStatusCode";
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
      RestfulUtils.sendUnavailableAPIError,
      (
        response: express.Response,
        transactionListResponse: TransactionListResponse
      ) => {
        // Check result
        const requestResult = AppResponseConverter.getTransactionListFromAPIResponse(
          transactionListResponse
        );
        if (requestResult.isLeft()) {
          RestfulUtils.sendErrorResponse(
            response,
            requestResult.value,
            HttpErrorStatusCode.FORBIDDEN
          );
          return;
        }
        RestfulUtils.sendSuccessResponse(response, requestResult.value);
      },
      req.query.apiRequestToken,
      req.params.id,
      req.query.start,
      req.query.size
    );
  }
}
