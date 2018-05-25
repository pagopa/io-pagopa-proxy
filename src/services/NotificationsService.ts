/**
 * Notification Services
 * Provide services related to Notification (Avvisatura) to communicate with PagoPaAPI and Cd Avviso API
 */

import { Either, Left } from "fp-ts/lib/Either";
import { CDAvvisiConfig, PagoPaConfig } from "../Configuration";
import { ControllerError } from "../enums/ControllerError";
import { NotificationSubscriptionRequestType } from "../enums/NotificationSubscriptionType";
import { NotificationsDispatchRequest } from "../types/controllers/NotificationsDispatchRequest";
import { FiscalCode } from "../types/FiscalCode";

// Send a request to PagoPaAPI to update subscription (Activation or Deactivation)
export async function updateNotificationsSubscriptionToPagoPaAPI(
  fiscalCode: FiscalCode,
  requestType: NotificationSubscriptionRequestType,
  pagoPaConfig: PagoPaConfig
): Promise<Either<ControllerError, void>> {
  // TODO
  return new Left(ControllerError.ERROR_API_UNAVAILABLE);
}

// Send a notification to CD Avvisi API
export async function sendNotificationToAPIAvvisi(
  notificationsDispatchRequest: NotificationsDispatchRequest,
  cdAvvisiConfig: CDAvvisiConfig
): Promise<Either<ControllerError, void>> {
  // TODO
  return new Left(ControllerError.ERROR_API_UNAVAILABLE);
}
