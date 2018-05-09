/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 */

import * as express from "express";
import { ControllerError } from "../enums/ControllerError";
import { UserAPI } from "../api/services/UserAPI";
import {
  ILoginAnonymousResponse,
  ILoginResponse
} from "../api/types/LoginResponse";
import { AppResponseConverter } from "../utils/AppResponseConverter";
import { RestfulUtils } from "../utils/RestfulUtils";

// User Controller
export class UserController {
  // Login existing user with username and password
  public static login(req: express.Request, res: express.Response): void {
    // Check input
    if (req.query.username === undefined || req.query.password === undefined) {
      RestfulUtils.setErrorResponse(res, ControllerError.ERROR_INVALID_INPUT);
      return;
    }

    // Try to login using PagoPaAPI
    UserAPI.login(
      res,
      RestfulUtils.handleErrorCallback,
      (response: express.Response, loginResponse: ILoginResponse) => {
        // Success callback
        RestfulUtils.setSuccessResponse(
          response,
          AppResponseConverter.getLoginFromAPIResponse(loginResponse)
        );
      },
      req.query.username,
      req.query.password
    );
  }

  // Login existing user with username and password
  public static loginAnonymous(
    req: express.Request,
    res: express.Response
  ): void {
    // Check input
    if (req.query.email === undefined || req.query.idPayment === undefined) {
      RestfulUtils.setErrorResponse(res, ControllerError.ERROR_INVALID_INPUT);
      return;
    }

    // Try to login using PagoPaAPI
    UserAPI.loginAnonymous(
      res,
      RestfulUtils.handleErrorCallback,
      (
        response: express.Response,
        loginAnonymousResponse: ILoginAnonymousResponse
      ) => {
        // Success callback
        RestfulUtils.setSuccessResponse(
          response,
          AppResponseConverter.getLoginAnonymusFromAPIResponse(
            loginAnonymousResponse
          )
        );
      },
      req.query.email,
      req.query.idPayment
    );
  }
}
