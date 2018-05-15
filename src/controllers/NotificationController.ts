/**
 * Tests for Notification Controllers
 * Send HTTP requests to Notification Controllers and check mocked responses
 */

import * as express from "express";
import { NotificationAPI } from "../api/services/NotificationAPI";
import { INotificationSubscriptionResponse } from "../api/types/NotificationSubscriptionResponse";
import { ControllerError } from "../enums/ControllerError";
import { NotificationSubscriptionRequestType } from "../enums/NotificationSubscriptionType";
import { AppResponseConverter } from "../utils/AppResponseConverter";
import { RestfulUtils } from "../utils/RestfulUtils";

// Notification Controller
export class NotificationController {
  // Update user subscription to Notification Service
  public static updateSubscription(
    req: express.Request,
    res: express.Response,
    requestType: NotificationSubscriptionRequestType
  ): void {
    // Check input
    if (req.params.fiscalCode === undefined || requestType === undefined) {
      RestfulUtils.setErrorResponse(res, ControllerError.ERROR_INVALID_INPUT);
      return;
    }

    // Require subscription to API
    NotificationAPI.updateSubscription(
      res,
      RestfulUtils.handleErrorCallback,
      (
        response: express.Response,
        notificationSubscriptionResponse: INotificationSubscriptionResponse
      ) => {
        // Success callback
        RestfulUtils.setSuccessResponse(
          response,
          AppResponseConverter.getNotificationSubscriptionResponseFromAPIResponse(
            notificationSubscriptionResponse
          )
        );
      },
      req.params.fiscalCode,
      requestType
    );
  }
}
