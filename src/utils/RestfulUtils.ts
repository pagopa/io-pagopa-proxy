/**
 * Restful Utils
 * Define common utils used by controllers
 */

import * as express from "express";
import { NonEmptyString } from "italia-ts-commons/lib/strings";
import { ControllerError } from "../enums/ControllerError";
import { HttpErrorStatusCode } from "../enums/HttpErrorStatusCode";
import { IRestfulObject } from "../types/BaseResponseApp";
import { FiscalCode } from "../types/FiscalCode";
import { logger } from "../utils/Logger";

// Utils used by Controllers
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
  content: IRestfulObject
): void {
  res.status(200).json(content);
}

// A default error callback handler for unavailable API services
export function sendUnavailableAPIError(res: express.Response): void {
  // Error callback
  sendErrorResponse(
    res,
    ControllerError.ERROR_PAGOPA_API_UNAVAILABLE,
    HttpErrorStatusCode.SERVICE_UNAVAILABLE
  );
}

// Provide a valid url to activate notification subscription
export function getActivateNotificationSubscriptionUrlForApp(
  fiscalCode: FiscalCode,
  serviceUrl: NonEmptyString
): string {
  return serviceUrl.replace(":fiscalCode", fiscalCode);
}
// Provide a valid url to deactivate notification subscription
export function getDeactivateNotificationSubscriptionUrlForApp(
  fiscalCode: FiscalCode,
  serviceUrl: NonEmptyString
): string {
  return serviceUrl.replace(":fiscalCode", fiscalCode);
}
