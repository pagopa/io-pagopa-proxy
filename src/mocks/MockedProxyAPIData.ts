/**
 * Mock Data for PagoPaAPI Server
 * Define Mocked Responses used by MockedProxyAPIApp
 */

import {
  AckResult,
  NotificationSubscriptionResponseAPI
} from "../types/api/NotificationSubscriptionResponseAPI";

export function getNotificationResponseMocked(
  positive: boolean
): NotificationSubscriptionResponseAPI {
  return {
    result: positive === true ? AckResult.encode("OK") : AckResult.encode("KO")
  };
}
