/**
 * NotificationAPI Services
 * Provide services related to Notification (Avvisatura) to communicate with PagoPaAPI
 */

import * as express from "express";
import fetch from "node-fetch";
import { CONFIG } from "../../Configuration";
import { NotificationSubscriptionRequestType } from "../../enums/NotificationSubscriptionType";
import { NotificationSubscriptionResponse } from "../types/NotificationSubscriptionResponse";

// Notification Service for PagoPA communications
export class NotificationAPI {
  // Retrieve wallet containing payment methods
  public static updateSubscription(
    fiscalCode: string,
    requestType: NotificationSubscriptionRequestType,
    res: express.Response,
    errorCallback: (res: express.Response, errorMsg: string) => void,
    successCallback: (
      res: express.Response,
      notificationSubscriptionResponse: NotificationSubscriptionResponse
    ) => void
  ): void {
    const url =
      CONFIG.PAGOPA.HOST +
      ":" +
      String(CONFIG.PAGOPA.PORT) +
      CONFIG.PAGOPA.SERVICES.NOTIFICATION_UPDATE_SUBSCRIPTION;
    const body = {
      timestamp: Date.now(),
      requestId: Math.floor(Math.random() * 99999999999999999999),
      operation:
        requestType === NotificationSubscriptionRequestType.ACTIVATION
          ? "A"
          : "D",
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
}
