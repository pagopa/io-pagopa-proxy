/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 *
 */

import * as t from "io-ts";
import { string } from "io-ts";
import { enumType } from "italia-ts-commons/lib/types";

export enum PaymentMethodEnum {
    BANK_ACCOUNT,
    CREDIT_CARD,
    OTHER
}

export type PaymentMethodType = t.TypeOf<typeof PaymentMethod>;

export const PaymentMethodType = enumType<PaymentMethodEnum>(
    PaymentMethodEnum,
    "PaymentMethodType"
);

// export interface IPaymentMethod {
//     readonly id: string; // ID of the specific payment method, ie: 2 credit cards
//     // have different ids but same PaymentMethodType
//     readonly type: PaymentMethodType;
// }

export const PaymentMethod = t.interface({
    id: string,
    type: PaymentMethodType
});

export type PaymentMethod = t.TypeOf<typeof PaymentMethod>;