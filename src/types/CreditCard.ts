/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 *
 */

import { IPaymentMethod } from "./PaymentMethod";

export interface ICreditCard extends IPaymentMethod {
    readonly issuer: string;
    readonly number: string;
    readonly message: string; // a message to visualize (e.g. last usage)
}
