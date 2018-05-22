/**
 * Tests for Notification Controllers
 * Send HTTP requests to Notification Controllers and check mocked responses
 */

import * as express from "express";
import { PagoPaConfig } from "../Configuration";
import { ControllerError } from "../enums/ControllerError";
import { HttpErrorStatusCode } from "../enums/HttpErrorStatusCode";
import { NotificationSubscriptionRequestType } from "../enums/NotificationSubscriptionType";
import * as NotificationAPI from "../services/NotificationAPI";
import { NotificationSubscriptionResponseAPI } from "../types/api/NotificationSubscriptionResponseAPI";
import { NotificationSubscriptionRequestCtrl } from "../types/controllers/NotificationSubscriptionRequestCtrl";
import * as AppResponseConverter from "../utils/AppResponseConverter";
import * as RestfulUtils from "../utils/RestfulUtils";

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
  const errorOrRequest = NotificationSubscriptionRequestCtrl.decode(req.params);
  if (errorOrRequest.isLeft()) {
    RestfulUtils.sendErrorResponse(
      res,
      ControllerError.ERROR_INVALID_INPUT,
      HttpErrorStatusCode.BAD_REQUEST
    );
    return;
  }

  // Require subscription to API
  NotificationAPI.updateSubscription(
    errorOrRequest.value.fiscalCode,
    requestType,
    res,
    pagoPaConfig,
    RestfulUtils.sendUnavailableAPIError,
    (
      response: express.Response,
      notificationSubscriptionResponse: NotificationSubscriptionResponseAPI
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
