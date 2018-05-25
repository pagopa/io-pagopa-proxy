/**
 * Notification Controllers
 * Controllers for Notifications Endpoints
 */

import * as express from "express";
import { CDAvvisiConfig, PagoPaConfig } from "../Configuration";
import { ControllerError } from "../enums/ControllerError";
import { HttpErrorStatusCode } from "../enums/HttpErrorStatusCode";
import { NotificationSubscriptionRequestType } from "../enums/NotificationSubscriptionType";
import { NotificationsDispatchRequestPagoPa } from "../FakePagoPaExternalTypes";
import * as NotificationsService from "../services/NotificationsService";
import { FiscalCode } from "../types/FiscalCode";
import * as NotificationsConverter from "../utils/converters/NotificationsConverter";
import * as RestfulUtils from "../utils/RestfulUtils";

// Forward a notification activation request to PagoPa API
export async function activateNotificationsSubscription(
  req: express.Request,
  res: express.Response,
  pagoPaConfig: PagoPaConfig
): Promise<boolean> {
  return updateNotificationsSubscription(
    req,
    res,
    NotificationSubscriptionRequestType.ACTIVATION,
    pagoPaConfig
  );
}

// Forward a notification deactivation request to PagoPa API
export async function deactivateNotificationsSubscription(
  req: express.Request,
  res: express.Response,
  pagoPaConfig: PagoPaConfig
): Promise<boolean> {
  return updateNotificationsSubscription(
    req,
    res,
    NotificationSubscriptionRequestType.DEACTIVATION,
    pagoPaConfig
  );
}

// Forward a notification activation\deactivation request to PagoPa API
async function updateNotificationsSubscription(
  req: express.Request,
  res: express.Response,
  requestType: NotificationSubscriptionRequestType,
  pagoPaConfig: PagoPaConfig
): Promise<boolean> {
  // Validate input
  const errorOrFiscalCode = FiscalCode.decode(req.query.fiscalCode);
  if (errorOrFiscalCode.isLeft()) {
    RestfulUtils.sendErrorResponse(
      res,
      ControllerError.ERROR_INVALID_INPUT,
      HttpErrorStatusCode.BAD_REQUEST
    );
    return false;
  }

  // Require subscription activation\deactivation to PagoPa API
  const errorOrApiResponse = await NotificationsService.updateNotificationsSubscriptionToPagoPaAPI(
    errorOrFiscalCode.value,
    requestType,
    pagoPaConfig
  );

  // Provide a response to applicant
  if (errorOrApiResponse.isLeft()) {
    if (errorOrApiResponse.value === ControllerError.ERROR_API_UNAVAILABLE) {
      RestfulUtils.sendUnavailableAPIError(res);
    } else {
      RestfulUtils.sendErrorResponse(
        res,
        ControllerError.ERROR_INVALID_INPUT,
        HttpErrorStatusCode.BAD_REQUEST
      );
    }
    return false;
  }
  RestfulUtils.sendSuccessResponse(res);
  return true;
}

// Forward new notification from PagoPa API to CD Avvisi API
export async function dispatchNotification(
  req: express.Request,
  res: express.Response,
  cdAvvisiConfig: CDAvvisiConfig
): Promise<boolean> {
  // Check input
  const errorOrNotificationsDispatchRequestPagoPa = NotificationsDispatchRequestPagoPa.decode(
    req.params
  );
  if (errorOrNotificationsDispatchRequestPagoPa.isLeft()) {
    RestfulUtils.sendErrorResponse(
      res,
      ControllerError.ERROR_INVALID_INPUT,
      HttpErrorStatusCode.BAD_REQUEST
    );
    return false;
  }

  // Convert PagoPaAPI request to CD Avvisi API request
  const errorOrNotificationsDispatchRequest = NotificationsConverter.getNotificationsDispatchRequest(
    errorOrNotificationsDispatchRequestPagoPa.value
  );
  if (errorOrNotificationsDispatchRequest.isLeft()) {
    RestfulUtils.sendErrorResponse(
      res,
      ControllerError.ERROR_INVALID_INPUT,
      HttpErrorStatusCode.BAD_REQUEST
    );
  }

  // Forward request to API Avvisi (CD)
  const errorOrNotificationToAPIAvvisi = await NotificationsService.sendNotificationToAPIAvvisi(
    errorOrNotificationsDispatchRequest.value,
    cdAvvisiConfig
  );

  // Provide a response to PagoPa API (Avvisatura)
  if (errorOrNotificationToAPIAvvisi.isLeft()) {
    RestfulUtils.sendUnavailableAPIError(res);
    return false;
  }
  RestfulUtils.sendSuccessResponse(res);
  return true;
}
