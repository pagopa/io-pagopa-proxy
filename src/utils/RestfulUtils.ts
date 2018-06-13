/**
 * Restful Utils
 * Define common utils used by controllers
 */

import * as express from "express";
import {
  HttpStatusCodeEnum,
  ResponseErrorGeneric
} from "italia-ts-commons/lib/responses";
import { ControllerError } from "../enums/ControllerError";
import { HttpErrorStatusCode } from "../enums/HttpErrorStatusCode";
import { logger } from "../utils/Logger";

// Send an error message for express response
export function sendErrorResponse(
  res: express.Response,
  errorMsg: ControllerError,
  httpStatusCodeEnum: HttpStatusCodeEnum
): ControllerError {
  logger.error(`Controller response is an error: ${errorMsg}`);

  ResponseErrorGeneric(httpStatusCodeEnum, errorMsg, errorMsg).apply(res);
  return errorMsg;
}

// A default error callback handler for unavailable API services
export function sendUnavailableAPIError(res: express.Response): void {
  // Error callback
  sendErrorResponse(
    res,
    ControllerError.ERROR_API_UNAVAILABLE,
    HttpErrorStatusCode.keys.INTERNAL_ERROR
  );
}
