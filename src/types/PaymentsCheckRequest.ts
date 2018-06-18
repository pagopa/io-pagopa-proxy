/* tslint:disable:ordered-imports */
/* tslint:disable:no-consecutive-blank-lines */
/* tslint:disable:no-trailing-whitespace */
/* tslint:disable:max-line-length */
/* tslint:disable:jsdoc-format */
/* tslint:disable:interface-name */
/* tslint:disable:no-any */
/* tslint:disable:object-literal-sort-keys */

import { CodiceIdRPT } from "./CodiceIdRPT";
import * as t from "io-ts";

/**
 * Define the request received from CD App to require a payment (RPT) check
 */

// required attributes
const PaymentsCheckRequestR = t.interface({
  codiceIdRPT: CodiceIdRPT
});

// optional attributes
const PaymentsCheckRequestO = t.partial({});

export const PaymentsCheckRequest = t.exact(
  t.intersection(
    [PaymentsCheckRequestR, PaymentsCheckRequestO],
    "PaymentsCheckRequest"
  )
);

export type PaymentsCheckRequest = t.TypeOf<typeof PaymentsCheckRequest>;
