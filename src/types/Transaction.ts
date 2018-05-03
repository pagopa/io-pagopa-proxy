/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 *
 */

import * as t from "io-ts";
import { number, string } from "io-ts";

import { DateFromString } from "italia-ts-commons/lib/dates";
import { NonNegativeNumber } from "italia-ts-commons/lib/numbers";
import { NonEmptyString, PatternString } from "italia-ts-commons/lib/strings";
import { PaymentMethod } from "./PaymentMethod";

export type CountryCurrencyCode = t.TypeOf<typeof CountryCurrencyCode>;
export const CountryCurrencyCode = PatternString("^[A-Z]{3}$");

export const Amount = t.interface({
  quantity: number, // TODO figure out whether negative transactions should be allowed (e.g. refunds)
  precision: NonNegativeNumber, // -> integer?
  currency: CountryCurrencyCode
});
export type Amount = t.TypeOf<typeof Amount>;

export const Transaction = t.interface({
  id: string,
  method: PaymentMethod,
  fee: Amount,
  amount: Amount,
  description: string,
  date: DateFromString,
  recipient: NonEmptyString
});
export type Transaction = t.TypeOf<typeof Transaction>;
