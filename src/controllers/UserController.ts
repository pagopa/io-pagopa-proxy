/**
 * Tests for User Controllers
 * Send HTTP requests to User Controllers (login) and check mocked responses
 */

import * as express from "express";
import { UserAPI } from "../api/services/UserAPI";
import {
  LoginAnonymousResponse,
  LoginResponse
} from "../api/types/LoginResponse";
import { ControllerError } from "../enums/ControllerError";
import { HttpErrorStatusCode } from "../enums/HttpErrorStatusCode";
import { AppResponseConverter } from "../utils/AppResponseConverter";
import { RestfulUtils } from "../utils/RestfulUtils";

// User Controller
export class UserController {
  // Login existing user with username and password
  public static login(req: express.Request, res: express.Response): void {
    // Check input
    if (req.query.username === undefined || req.query.password === undefined) {
      RestfulUtils.sendErrorResponse(
        res,
        ControllerError.ERROR_INVALID_INPUT,
        HttpErrorStatusCode.BAD_REQUEST
      );
      return;
    }

    // Try to login using PagoPaAPI
    UserAPI.login(
      res,
      RestfulUtils.sendUnavailableAPIError,
      (response: express.Response, loginResponse: LoginResponse) => {
        // Check result
        const requestResult = AppResponseConverter.getLoginFromAPIResponse(
          loginResponse
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
      RestfulUtils.sendErrorResponse(
        res,
        ControllerError.ERROR_INVALID_INPUT,
        HttpErrorStatusCode.BAD_REQUEST
      );
      return;
    }

    // Try to login using PagoPaAPI
    UserAPI.loginAnonymous(
      res,
      RestfulUtils.sendUnavailableAPIError,
      (
        response: express.Response,
        loginAnonymousResponse: LoginAnonymousResponse
      ) => {
        // Check result
        const requestResult = AppResponseConverter.getLoginAnonymusFromAPIResponse(
          loginAnonymousResponse
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
      req.query.email,
      req.query.idPayment
    );
  }
}
