/**
 * NotificationSubscriptionResponse Types
 * Define response interfaces used by PagoPaAPI for Notification services (Avvisatura)
 */

import * as t from "io-ts";
import { AckResult } from "./BaseResponse";

export const NotificationSubscriptionResponse = t.interface({
  result: AckResult
});
export type NotificationSubscriptionResponse = t.TypeOf<
  typeof NotificationSubscriptionResponse
>;
