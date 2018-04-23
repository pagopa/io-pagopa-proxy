/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 *
 */

import * as t from "io-ts";
import { string } from "io-ts";
import { PaymentMethod } from "./PaymentMethod";


export const CreditCard = t.intersection([
    PaymentMethod,
    t.interface({
        issuer: string,
        number: string,
        message: string // a message to visualize (e.g. last usage)
    })
]);

export type CreditCard = t.TypeOf<typeof CreditCard>;