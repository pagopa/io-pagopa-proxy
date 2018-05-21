/**
 * Tests for Notification Controllers
 * Send HTTP requests to Notification Controllers and check mocked responses
 */

import * as express from "express";
import { NotificationAPI } from "../api/services/NotificationAPI";
import { NotificationSubscriptionResponse } from "../api/types/NotificationSubscriptionResponse";
import { ControllerError } from "../enums/ControllerError";
import { HttpErrorStatusCode } from "../enums/HttpErrorStatusCode";
import { NotificationSubscriptionRequestType } from "../enums/NotificationSubscriptionType";
import { FiscalCode } from "../types/FiscalCode";
import { AppResponseConverter } from "../utils/AppResponseConverter";
import { RestfulUtils } from "../utils/RestfulUtils";

// Notification Controller
export class NotificationController {
  public static notificationActivation(
    req: express.Request,
    res: express.Response
  ): void {
    this.updateSubscription(
      req,
      res,
      NotificationSubscriptionRequestType.ACTIVATION
    );
  }

  public static notificationDeactivation(
    req: express.Request,
    res: express.Response
  ): void {
    this.updateSubscription(
      req,
      res,
      NotificationSubscriptionRequestType.DEACTIVATION
    );
  }

  // Update user subscription to Notification Service
  private static updateSubscription(
    req: express.Request,
    res: express.Response,
    requestType: NotificationSubscriptionRequestType
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
}
