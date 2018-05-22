/**
 * NotificationAPI Services
 * Provide services related to Notification (Avvisatura) to communicate with PagoPaAPI
 */

import * as express from "express";
import fetch from "node-fetch";
import * as uuid from "uuid";
import { PagoPaConfig } from "../Configuration";
import { NotificationSubscriptionRequestType } from "../enums/NotificationSubscriptionType";
import { NotificationSubscriptionResponseAPI } from "../types/api/NotificationSubscriptionResponseAPI";
import { FiscalCode } from "../types/FiscalCode";

// Update subscription (Activation or Deactivation) to Notification Service for a fiscalCode
export function updateSubscription(
  fiscalCode: FiscalCode,
  requestType: NotificationSubscriptionRequestType,
  res: express.Response,
  pagoPaConfig: PagoPaConfig,
  errorCallback: (res: express.Response, errorMsg: string) => void,
  successCallback: (
    res: express.Response,
    notificationSubscriptionResponse: NotificationSubscriptionResponseAPI
  ) => void
): void {
  const url = `${pagoPaConfig.HOST}:${pagoPaConfig.PORT}${
    pagoPaConfig.SERVICES.NOTIFICATION_UPDATE_SUBSCRIPTION
  }`;
  const body = {
    timestamp: Date.now(),
    requestId: uuid.v1(),
    operation:
      requestType === NotificationSubscriptionRequestType.ACTIVATION
        ? OperationType.Activation
        : OperationType.Deactivation,
    user: {
      type: "F",
      id: fiscalCode
    }
  };

  fetch(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" }
  })
    .then(fetchRes => fetchRes.json())
    .then(json => successCallback(res, json))
    .catch(err => errorCallback(res, err));
}

enum OperationType {
  Activation = "A",
  Deactivation = "B"
}
