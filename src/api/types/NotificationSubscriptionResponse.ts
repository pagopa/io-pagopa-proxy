/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 */

export interface INotificationSubscriptionResponse {
  readonly result: AckResult;
}

export enum AckResult {
  OK = "OK",
  KO = "KO"
}
