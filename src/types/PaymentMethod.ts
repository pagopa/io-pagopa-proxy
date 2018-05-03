/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 *
 */

import * as t from "io-ts";
import { string } from "io-ts";
import { enumType } from "italia-ts-commons/lib/types";

export enum PaymentMethodEnum {
  BANK_ACCOUNT = "BANK_ACCOUNT",
  CREDIT_CARD = "CREDIT_CARD",
  OTHER = "OTHER"
}

export type PaymentMethodType = t.TypeOf<typeof PaymentMethodType>;

export const PaymentMethodType = enumType<PaymentMethodEnum>(
  PaymentMethodEnum,
  "PaymentMethodType"
);

export const PaymentMethod = t.interface({
  id: string,
  type: PaymentMethodType
});

export type PaymentMethod = t.TypeOf<typeof PaymentMethod>;
