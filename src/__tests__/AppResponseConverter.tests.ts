/**
 * Test AppResponseConverter utils
 */

import { MockedProxyAPIData } from "../mocks/MockedProxyAPIData";
import { AppResponseConverter } from "../utils/AppResponseConverter";

describe("AppResponseConverter", () => {
  test("NotificationSubscriptionResponse should be valid", () => {
    const response = AppResponseConverter.getNotificationSubscriptionResponseFromAPIResponse(
      MockedProxyAPIData.getNotificationResponseMocked(true)
    );
    expect(response.isRight()).toBe(true);
  });

  test("NotificationSubscriptionResponse should be rejected", () => {
    const response = AppResponseConverter.getNotificationSubscriptionResponseFromAPIResponse(
      MockedProxyAPIData.getNotificationResponseMocked(false)
    );
    expect(response.isLeft()).toBe(true);
  });
});
