/* tslint:disable:ordered-imports */
/* tslint:disable:no-consecutive-blank-lines */
/* tslint:disable:no-trailing-whitespace */
/* tslint:disable:max-line-length */
/* tslint:disable:jsdoc-format */
/* tslint:disable:interface-name */
/* tslint:disable:no-any */
/* tslint:disable:object-literal-sort-keys */

import { FiscalCode } from "./FiscalCode";
import * as t from "io-ts";
import { NonNegativeNumber } from "italia-ts-commons/lib/numbers";
import { PatternString } from "italia-ts-commons/lib/strings";

/**
 * Identify a payment (qrcode information)
 */

// required attributes
const CodiceIdRPTR = t.interface({
  CF: FiscalCode,

  AuxDigit: NonNegativeNumber,

  CodIUV: PatternString("[0-9]{15}|[0-9]{17}")
});

// optional attributes
const CodiceIdRPTO = t.partial({
  CodStazPA: PatternString("[0-9]{2}")
});

export const CodiceIdRPT = t.exact(
  t.intersection([CodiceIdRPTR, CodiceIdRPTO], "CodiceIdRPT")
);

export type CodiceIdRPT = t.TypeOf<typeof CodiceIdRPT>;
