/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 */

import * as express from "express";
import { ControllerError } from "../api/enums/ControllerError";
import { StatusCode } from "../api/enums/StatusCode";
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
        this.setErrorResponse(
          res,
          new Error(ControllerError.ERROR_INVALID_TOKEN)
        );
      }
      return false;
    }
    return true;
  }

  // Set an error message for express response
  public static setErrorResponse(res: express.Response, error: Error): void {
    console.error("Returning error: " + error.message);
    res.status(500).json({ status: StatusCode.ERROR, message: error.message });
  }

  // Set a success message for express response
  public static setSuccessResponse(
    res: express.Response,
    content: IRestfulObject
  ): void {
    content.status = StatusCode.OK; // tslint:disable-line
    res.status(200).json(content);
  }
}
