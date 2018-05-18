/**
 * Response Converter
 * Define utils to convert data from PagoPaAPI interfaces to controller interfaces and viceversa
 */

import { Either, Left, Right } from "fp-ts/lib/Either";
import { AckResult } from "../api/types/BaseResponse";
import { NotificationSubscriptionResponse } from "../api/types/NotificationSubscriptionResponse";
import { ControllerError } from "../enums/ControllerError";
import { NotificationSubscriptionResponseApp } from "../types/NotificationSubscriptionResponseApp";

// Data converter for controllers to translate API responses to Controller responses
export class AppResponseConverter {
  public static getNotificationSubscriptionResponseFromAPIResponse(
    notificationSubscriptionResponse: NotificationSubscriptionResponse
  ): Either<ControllerError, NotificationSubscriptionResponseApp> {
    if (notificationSubscriptionResponse.result !== AckResult.keys.OK) {
      return new Left(ControllerError.REQUEST_REJECTED);
    }
    return new Right({
      result: true
    });
  }
}
