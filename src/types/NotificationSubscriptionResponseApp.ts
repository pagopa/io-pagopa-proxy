/**
 * Notification Subscription Response Types
 * Define response interfaces used by controllers for Notification services (Avvisatura)
 */

import { IRestfulObject } from "./BaseResponseApp";

export interface INotificationSubscriptionResponseApp extends IRestfulObject {
  readonly result: boolean;
}
