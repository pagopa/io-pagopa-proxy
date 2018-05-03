/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 */

import * as express from "express";
import * as Mocked from "../MockedData";
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

    // Check if optional parameters are set
    if (req.query.transactionId !== undefined) {
      // TODO: use it
    }
    if (req.query.startDate !== undefined) {
      // TODO: use it
    }
    if (req.query.endDate !== undefined) {
      // TODO: use it
    }
    if (req.query.limit !== undefined) {
      // TODO: use it and use a default max value
    }
    ControllerUtils.setSuccessResponse(res, {
      transactions: Mocked.transactions
    });
  }
}
