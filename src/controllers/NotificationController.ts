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
import { NotificationSubscriptionRequestCtrl } from "../types/controllers/NotificationSubscriptionRequestCtrl";
import * as AppResponseConverter from "../utils/AppResponseConverter";
import * as RestfulUtils from "../utils/RestfulUtils";

export function activeNotificationsSubscription(
  req: express.Request,
  res: express.Response,
  pagoPaConfig: PagoPaConfig
): void {
  updateNotificationsSubscription(
    req,
    res,
    NotificationSubscriptionRequestType.ACTIVATION,
    pagoPaConfig
  ).catch();
}

export function deactiveNotificationsSubscription(
  req: express.Request,
  res: express.Response,
  pagoPaConfig: PagoPaConfig
): void {
  updateNotificationsSubscription(
    req,
    res,
    NotificationSubscriptionRequestType.DEACTIVATION,
    pagoPaConfig
  ).catch();
}

// Update user subscription to Notification Service
async function updateNotificationsSubscription(
  req: express.Request,
  res: express.Response,
  requestType: NotificationSubscriptionRequestType,
  pagoPaConfig: PagoPaConfig
): Promise<boolean> {
  // Check input
  const errorOrRequest = NotificationSubscriptionRequestCtrl.decode(req.params);
  if (errorOrRequest.isLeft()) {
    RestfulUtils.sendErrorResponse(
      res,
      ControllerError.ERROR_INVALID_INPUT,
      HttpErrorStatusCode.BAD_REQUEST
    );
    return false;
  }

  // Require subscription to API
  const errorOrApiResponse = await NotificationAPI.updateNotificationsSubscription(
    errorOrRequest.value.fiscalCode,
    requestType,
    pagoPaConfig
  );

  if (errorOrApiResponse.isLeft()) {
    RestfulUtils.sendUnavailableAPIError(res);
    return false;
  }

  // Check result
  const requestResult = AppResponseConverter.getNotificationSubscriptionResponseFromAPIResponse(
    errorOrApiResponse.value
  );
  if (requestResult.isLeft()) {
    RestfulUtils.sendErrorResponse(
      res,
      requestResult.value,
      HttpErrorStatusCode.FORBIDDEN
    );
    return false;
  }
  RestfulUtils.sendSuccessResponse(res, requestResult.value);
  return true;
}
