/**
 * Tests for Notification Controllers
 * Send HTTP requests to Notification Controllers and check mocked responses
 */

import * as express from "express";
import * as NotificationAPI from "../api/services/NotificationAPI";
import { NotificationSubscriptionResponse } from "../api/types/NotificationSubscriptionResponse";
import { PagoPaConfig } from "../Configuration";
import { ControllerError } from "../enums/ControllerError";
import { HttpErrorStatusCode } from "../enums/HttpErrorStatusCode";
import { NotificationSubscriptionRequestType } from "../enums/NotificationSubscriptionType";
import { FiscalCode } from "../types/FiscalCode";
import * as AppResponseConverter from "../utils/AppResponseConverter";
import * as RestfulUtils from "../utils/RestfulUtils";

// Notification Controller
export function notificationActivation(
  req: express.Request,
  res: express.Response,
  pagoPaConfig: PagoPaConfig
): void {
  updateSubscription(
    req,
    res,
    NotificationSubscriptionRequestType.ACTIVATION,
    pagoPaConfig
  );
}

export function notificationDeactivation(
  req: express.Request,
  res: express.Response,
  pagoPaConfig: PagoPaConfig
): void {
  updateSubscription(
    req,
    res,
    NotificationSubscriptionRequestType.DEACTIVATION,
    pagoPaConfig
  );
}

// Update user subscription to Notification Service
function updateSubscription(
  req: express.Request,
  res: express.Response,
  requestType: NotificationSubscriptionRequestType,
  pagoPaConfig: PagoPaConfig
): void {
  // Check input
  const fiscalCode = FiscalCode.decode(req.params.fiscalCode);
  if (fiscalCode.isLeft()) {
    RestfulUtils.sendErrorResponse(
      res,
      ControllerError.ERROR_INVALID_INPUT,
      HttpErrorStatusCode.BAD_REQUEST
    );
    return;
  }

  // Require subscription to API
  NotificationAPI.updateSubscription(
    fiscalCode.value,
    requestType,
    res,
    pagoPaConfig,
    RestfulUtils.sendUnavailableAPIError,
    (
      response: express.Response,
      notificationSubscriptionResponse: NotificationSubscriptionResponse
    ) => {
      // Check result
      const requestResult = AppResponseConverter.getNotificationSubscriptionResponseFromAPIResponse(
        notificationSubscriptionResponse
      );
      if (requestResult.isLeft()) {
        RestfulUtils.sendErrorResponse(
          response,
          requestResult.value,
          HttpErrorStatusCode.FORBIDDEN
        );
        return;
      }
      RestfulUtils.sendSuccessResponse(response, requestResult.value);
    }
  );
}
