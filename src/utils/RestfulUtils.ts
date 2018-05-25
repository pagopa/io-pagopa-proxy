/**
 * Restful Utils
 * Define common utils used by controllers
 */

import * as express from "express";
import { ControllerError } from "../enums/ControllerError";
import { HttpErrorStatusCode } from "../enums/HttpErrorStatusCode";
import { IRestfulObject } from "../types/IRestfulObject";
import { logger } from "../utils/Logger";

// Send an error message for express response
export function sendErrorResponse(
  res: express.Response,
  errorMsg: ControllerError,
  httpStatusCode: HttpErrorStatusCode
): void {
  logger.error(`Controller response is an error: ${errorMsg}`);
  res.status(httpStatusCode).json({ errorMessage: errorMsg });
}

// Send a success message for express response
export function sendSuccessResponse(
  res: express.Response,
  content?: IRestfulObject
): void {
  res.status(200).json(content);
}

// A default error callback handler for unavailable API services
export function sendUnavailableAPIError(res: express.Response): void {
  // Error callback
  sendErrorResponse(
    res,
    ControllerError.ERROR_API_UNAVAILABLE,
    HttpErrorStatusCode.SERVICE_UNAVAILABLE
  );
}
