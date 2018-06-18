/* tslint:disable:ordered-imports */
/* tslint:disable:no-consecutive-blank-lines */
/* tslint:disable:no-trailing-whitespace */
/* tslint:disable:max-line-length */
/* tslint:disable:jsdoc-format */
/* tslint:disable:interface-name */
/* tslint:disable:no-any */
/* tslint:disable:object-literal-sort-keys */

import * as t from "io-ts";
import { WithinRangeString } from "italia-ts-commons/lib/strings";

/**
 * Define the response to send to App to provide the payment activation status related to a codiceContestoPagamento
 */

// required attributes
const PaymentsActivationStatusCheckResponseR = t.interface({
  idPagamento: WithinRangeString(1, 35)
});

// optional attributes
const PaymentsActivationStatusCheckResponseO = t.partial({});

export const PaymentsActivationStatusCheckResponse = t.exact(
  t.intersection(
    [
      PaymentsActivationStatusCheckResponseR,
      PaymentsActivationStatusCheckResponseO
    ],
    "PaymentsActivationStatusCheckResponse"
  )
);

export type PaymentsActivationStatusCheckResponse = t.TypeOf<
  typeof PaymentsActivationStatusCheckResponse
>;
