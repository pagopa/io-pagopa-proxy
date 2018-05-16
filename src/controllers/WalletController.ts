/**
 * Tests for Wallet Controllers
 * Send HTTP requests to Wallet Controllers and check mocked responses
 */

import * as express from "express";
import { WalletAPI } from "../api/services/WalletAPI";
import { WalletResponse } from "../api/types/WalletResponse";
import { HttpErrorStatusCode } from "../enums/HttpErrorStatusCode";
import { AppResponseConverter } from "../utils/AppResponseConverter";
import { RestfulUtils } from "../utils/RestfulUtils";

// Wallet Controller
export class WalletController {
  // Retrieve the user wallet, containing the list of payment methods stored
  public static getWallet(req: express.Request, res: express.Response): void {
    // Check user session
    if (!RestfulUtils.checkTokenIntoRequest(req, res)) {
      return;
    }

    // Require wallet to API
    WalletAPI.getWalletResponse(
      res,
      RestfulUtils.sendUnavailableAPIError,
      (response: express.Response, walletResponse: WalletResponse) => {
        // Check result
        const requestResult = AppResponseConverter.getWalletFromAPIResponse(
          walletResponse
        );
        if (requestResult.isLeft()) {
          RestfulUtils.sendErrorResponse(
            response,
            requestResult.value,
            HttpErrorStatusCode.UNAUTHORIZED
          );
          return;
        }
        RestfulUtils.sendSuccessResponse(response, requestResult.value);
      },
      req.query.apiRequestToken
    );
  }
}
