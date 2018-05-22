/**
 * NotificationSubscriptionResponse Types
 * Define response interfaces used by PagoPaAPI for Notification services (Avvisatura)
 */

import * as t from "io-ts";

export const AckResult = t.keyof({ OK: "OK", KO: "KO" });
export type AckResult = t.TypeOf<typeof AckResult>;

export const NotificationSubscriptionResponseAPI = t.interface({
  result: AckResult
});
export type NotificationSubscriptionResponseAPI = t.TypeOf<
  typeof NotificationSubscriptionResponseAPI
>;
