/**
 * Mock Data for PagoPaAPI Server
 * Define Mocked Responses used by MockedProxyAPIApp
 */

// tslint:disable
import { AckResult } from "../api/types/BaseResponse";
import { NotificationSubscriptionResponse } from "../api/types/NotificationSubscriptionResponse";

export class MockedProxyAPIData {
  public static getNotificationResponseMocked(
    positive: boolean
  ): NotificationSubscriptionResponse {
    return {
      result:
        positive === true ? AckResult.encode("OK") : AckResult.encode("KO")
    };
  }
}
