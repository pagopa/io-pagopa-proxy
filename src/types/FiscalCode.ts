/**
 * FiscalCode Type
 */

import * as t from "io-ts";
import { PatternString } from "italia-ts-commons/lib/strings";

export const FiscalCode = PatternString(
  "^[A-Z]{6}[0-9LMNPQRSTUV]{2}[ABCDEHLMPRST][0-9LMNPQRSTUV]{2}[A-Z][0-9LMNPQRSTUV]{3}[A-Z]$"
);
export type FiscalCode = t.TypeOf<typeof FiscalCode>;
