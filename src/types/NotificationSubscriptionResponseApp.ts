/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 */

import { IRestfulObject } from "./BaseResponseApp";

export interface INotificationSubscriptionResponseApp extends IRestfulObject {
  readonly result: boolean;
}
