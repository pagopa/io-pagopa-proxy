/**
 * Notification Subscription Response Types
 * Define response interfaces used by controllers for Notification services (Avvisatura)
 */

import * as t from "io-ts";

export const NotificationSubscriptionResponseApp = t.interface({
  result: t.boolean
});
export type NotificationSubscriptionResponseApp = t.TypeOf<
  typeof NotificationSubscriptionResponseApp
>;
