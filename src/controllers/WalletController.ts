/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 */

import * as express from "express";
import { ControllerError } from "../api/enums/ControllerError";
import { WalletAPI } from "../api/services/WalletAPI";
import { IWalletResponse } from "../api/types/WalletResponse";
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
      (response: express.Response, errorMsg: string) => {
        // Error callback
        console.error(errorMsg);
        RestfulUtils.setErrorResponse(
          response,
          new Error(ControllerError.ERROR_PAGOPA_API)
        );
      },
      (response: express.Response, walletResponse: IWalletResponse) => {
        // Success callback
        RestfulUtils.setSuccessResponse(
          response,
          AppResponseConverter.getWalletFromAPIResponse(walletResponse)
        );
      },
      req.query.apiRequestToken
    );
  }
}
