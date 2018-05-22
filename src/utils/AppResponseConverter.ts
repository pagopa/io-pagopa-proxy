/**
 * Response Converter
 * Define utils to convert data from PagoPaAPI interfaces to controller interfaces and viceversa
 */

import { Either, Left, Right } from "fp-ts/lib/Either";
import { ControllerError } from "../enums/ControllerError";
import {
  AckResult,
  NotificationSubscriptionResponseAPI
} from "../types/api/NotificationSubscriptionResponseAPI";
import { NotificationSubscriptionResponseCtrl } from "../types/controllers/NotificationSubscriptionResponseCtrl";

// Data converter for controllers to translate API responses to Controller responses
export function getNotificationSubscriptionResponseFromAPIResponse(
  notificationSubscriptionResponse: NotificationSubscriptionResponseAPI
): Either<ControllerError, NotificationSubscriptionResponseCtrl> {
  if (notificationSubscriptionResponse.result !== AckResult.keys.OK) {
    return new Left(ControllerError.REQUEST_REJECTED);
  }
  return new Right({
    result: true
  });
}
