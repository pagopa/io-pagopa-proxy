/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 *
 */

import * as t from "io-ts";
import { string } from "io-ts";

import { NonEmptyString, PatternString } from "italia-ts-commons/lib/strings";

import { PaymentMethod } from "./PaymentMethod";

export type CreditCardNumber = t.TypeOf<typeof CreditCardNumber>;
export const CreditCardNumber = PatternString("^\\d{4} \\d{4} \\d{4} \\d{4}$");

export const CreditCard = t.intersection([
  PaymentMethod,
  t.interface({
    issuer: NonEmptyString,
    number: CreditCardNumber,
    message: string // a message to visualize (e.g. last usage)
  })
]);
export type CreditCard = t.TypeOf<typeof CreditCard>;
