/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 *
 */

import { IPaymentMethod } from "./PaymentMethod";

/**
 *
 */
export interface ITransaction {
    readonly method: IPaymentMethod;
    readonly fee: number;
    readonly amount: number;
    readonly currency: string;
    readonly description: string;
    readonly date: string;
    readonly time: string;
    readonly recipient: string;
    readonly isNew: boolean; // TODO: figure out how to handle this
}
