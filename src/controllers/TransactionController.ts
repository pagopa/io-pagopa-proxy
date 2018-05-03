/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 */

import * as express from "express";
import * as Mocked from "../MockedData";
import { Transaction } from "../types/Transaction";
import { extractUserFromRequest } from "../types/User";
import { ControllerUtils } from "../utils/ControllerUtils";

// Transaction Controller
export class TransactionController {
  // Retrieve user transactions
  public getTransactions(req: express.Request, res: express.Response): void {
    const errorOrUser = extractUserFromRequest(req);
    if (errorOrUser.isLeft()) {
      ControllerUtils.setErrorResponse(res, errorOrUser.value);
      return;
    }
    if (req.params.transactionId === undefined) {
      ControllerUtils.setSuccessResponse(res, {
        transactions: Mocked.transactions
      });
      return;
    }
    const singleTransaction = Transaction.decode(
      Mocked.transactions.find(method => method.id === req.params.transactionId)
    );
    if (!singleTransaction.isRight()) {
      ControllerUtils.setErrorResponse(
        res,
        new Error("Transactions not found")
      );
    }
    ControllerUtils.setSuccessResponse(res, {
      transactions: singleTransaction
    });
  }
}
