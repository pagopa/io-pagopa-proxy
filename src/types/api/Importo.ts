/* tslint:disable:ordered-imports */
/* tslint:disable:no-consecutive-blank-lines */
/* tslint:disable:no-trailing-whitespace */
/* tslint:disable:max-line-length */
/* tslint:disable:jsdoc-format */
/* tslint:disable:interface-name */
/* tslint:disable:no-any */
/* tslint:disable:object-literal-sort-keys */

import { WithinRangeNumber } from "italia-ts-commons/lib/numbers";
import * as t from "io-ts";

/**
 * Amount for payments
 */

export type Importo = t.TypeOf<typeof Importo>;
export const Importo = WithinRangeNumber(0.11, 999999.99);
