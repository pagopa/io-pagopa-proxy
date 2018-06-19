/* tslint:disable:ordered-imports */
/* tslint:disable:no-consecutive-blank-lines */
/* tslint:disable:no-trailing-whitespace */
/* tslint:disable:max-line-length */
/* tslint:disable:jsdoc-format */
/* tslint:disable:interface-name */
/* tslint:disable:no-any */
/* tslint:disable:object-literal-sort-keys */

import { WithinRangeString } from "italia-ts-commons/lib/strings";
import * as t from "io-ts";

/**
 * Transaction Id used to identify the communication flow
 */

export type CodiceContestoPagamento = t.TypeOf<typeof CodiceContestoPagamento>;
export const CodiceContestoPagamento = WithinRangeString(1, 35);
