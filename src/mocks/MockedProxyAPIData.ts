/**
 * Mock Data for PagoPaAPI Server
 * Define Mocked Responses used by MockedProxyAPIApp
 */

// tslint:disable
import {
  AckResult,
  NotificationSubscriptionResponse
} from "../api/types/NotificationSubscriptionResponse";

export function getNotificationResponseMocked(
  positive: boolean
): NotificationSubscriptionResponse {
  return {
    result: positive === true ? AckResult.encode("OK") : AckResult.encode("KO")
  };
}
