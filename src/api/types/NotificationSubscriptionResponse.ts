/**
 * NotificationSubscriptionResponse Types
 * Define response interfaces used by PagoPaAPI for Notification services (Avvisatura)
 */

import * as t from "io-ts";

export const AckResult = t.keyof({ OK: "OK", KO: "KO" });
export type AckResult = t.TypeOf<typeof AckResult>;

export const NotificationSubscriptionResponse = t.interface({
  result: AckResult
});
export type NotificationSubscriptionResponse = t.TypeOf<
  typeof NotificationSubscriptionResponse
>;
