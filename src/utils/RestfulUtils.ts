/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 */

import * as express from "express";
import { ControllerError } from "../enums/ControllerError";
import { StatusCode } from "../enums/StatusCode";
import { IRestfulObject } from "../types/BaseResponseApp";

// Utils used by Controllers
export class RestfulUtils {
  // Check if token is set into request. If token is invalid and res is provided, an error will be written
  public static checkTokenIntoRequest(
    req: express.Request,
    res?: express.Response
  ): boolean {
    if (req.query.token === undefined) {
      if (res !== undefined) {
        this.setErrorResponse(res, ControllerError.ERROR_INVALID_TOKEN);
      }
      return false;
    }
    return true;
  }

  // Set an error message for express response
  public static setErrorResponse(
    res: express.Response,
    errorMsg: string
  ): void {
    console.error("Controller response is an error: " + errorMsg);
    res.status(500).json({ status: StatusCode.ERROR, message: errorMsg });
  }

  // Set a success message for express response
  public static setSuccessResponse(
    res: express.Response,
    content: IRestfulObject | Error
  ): void {
    if (content instanceof Error) {
      console.error("Controller response is an error: " + content.message);
      res.status(200).json({
        status: StatusCode.ERROR,
        errorMessage: content.message
      });
    } else {
      res.status(200).json({
        status: StatusCode.OK,
        content
      });
    }
  }

  // A default error callback handler
  public static handleErrorCallback(
    response: express.Response
    // errorMsg?: string
  ): void {
    // Error callback
    RestfulUtils.setErrorResponse(
      response,
      ControllerError.ERROR_PAGOPA_API_UNAVAILABLE
    );
  }
}
