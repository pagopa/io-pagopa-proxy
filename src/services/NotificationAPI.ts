/**
 * NotificationAPI Services
 * Provide services related to Notification (Avvisatura) to communicate with PagoPaAPI
 */

import { Either, Left, Right } from "fp-ts/lib/Either";
import fetch from "node-fetch";
import * as uuid from "uuid";
import { PagoPaConfig } from "../Configuration";
import { ControllerError } from "../enums/ControllerError";
import { NotificationSubscriptionRequestType } from "../enums/NotificationSubscriptionType";
import { NotificationSubscriptionResponseAPI } from "../types/api/NotificationSubscriptionResponseAPI";
import { FiscalCode } from "../types/FiscalCode";
import { logger } from "../utils/Logger";

// Update subscription (Activation or Deactivation) to Notification Service for a fiscalCode
export async function updateNotificationsSubscription(
  fiscalCode: FiscalCode,
  requestType: NotificationSubscriptionRequestType,
  pagoPaConfig: PagoPaConfig
): Promise<Either<Error, NotificationSubscriptionResponseAPI>> {
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

  try {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" }
    });

    if (!response.ok || response.status !== 200) {
      return new Left(new Error(ControllerError.ERROR_PAGOPA_API_UNAVAILABLE));
    }

    const jsonResp = await response.json();
    const errorOrNotificationResponse = NotificationSubscriptionResponseAPI.decode(
      jsonResp
    );
    if (errorOrNotificationResponse.isLeft()) {
      return new Left(new Error(ControllerError.ERROR_INVALID_API_RESPONSE));
    }
    return new Right(errorOrNotificationResponse.value);
  } catch (error) {
    logger.error(error);
    return new Left(new Error(ControllerError.ERROR_PAGOPA_API_UNAVAILABLE));
  }
}

enum OperationType {
  Activation = "A",
  Deactivation = "B"
}
