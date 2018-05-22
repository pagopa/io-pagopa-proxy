/**
 * Notification Subscription Response Types
 * Define response interfaces used by controllers for Notification services (Avvisatura)
 */

import * as t from "io-ts";
import { FiscalCode } from "../FiscalCode";

export const NotificationSubscriptionRequestCtrl = t.interface({
  fiscalCode: FiscalCode
});
export type NotificationSubscriptionRequestCtrl = t.TypeOf<
  typeof NotificationSubscriptionRequestCtrl
>;
