/**
 * Restful Utils
 * Define common utils used by controllers
 */

import * as express from "express";
import { ControllerError } from "../enums/ControllerError";
import { HttpErrorStatusCode } from "../enums/HttpErrorStatusCode";
import { IRestfulObject } from "../types/BaseResponseApp";
import { logger } from "../utils/Logger";

// Utils used by Controllers
export class RestfulUtils {
  // Check if token is set into request. If token is invalid and res is provided, an error will be send
  public static checkTokenIntoRequest(
    req: express.Request,
    res?: express.Response
  ): boolean {
    if (req.query.token === undefined) {
      if (res !== undefined) {
        this.sendErrorResponse(
          res,
          ControllerError.ERROR_INVALID_TOKEN,
          HttpErrorStatusCode.BAD_REQUEST
        );
      }
      return false;
    }
    return true;
  }

  // Send an error message for express response
  public static sendErrorResponse(
    res: express.Response,
    errorMsg: ControllerError,
    httpStatusCode: HttpErrorStatusCode
  ): void {
    logger.error("Controller response is an error: " + errorMsg);
    res.status(httpStatusCode).json({ errorMessage: errorMsg });
  }

  // Send a success message for express response
  public static sendSuccessResponse(
    res: express.Response,
    content: IRestfulObject
  ): void {
    res.status(200).json(content);
  }

  // A default error callback handler for unavailable API services
  public static sendUnavailableAPIError(res: express.Response): void {
    // Error callback
    RestfulUtils.sendErrorResponse(
      res,
      ControllerError.ERROR_PAGOPA_API_UNAVAILABLE,
      HttpErrorStatusCode.SERVICE_UNAVAILABLE
    );
  }
}
