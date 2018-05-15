/**
 * NotificationSubscriptionResponse Types
 * Define response interfaces used by PagoPaAPI for Notification services (Avvisatura)
 */

export interface INotificationSubscriptionResponse {
  readonly result: AckResult;
}

export enum AckResult {
  OK = "OK",
  KO = "KO"
}
