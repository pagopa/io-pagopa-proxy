/* tslint:disable:ordered-imports */
/* tslint:disable:no-consecutive-blank-lines */
/* tslint:disable:no-trailing-whitespace */
/* tslint:disable:max-line-length */
/* tslint:disable:jsdoc-format */
/* tslint:disable:interface-name */
/* tslint:disable:no-any */
/* tslint:disable:object-literal-sort-keys */

import { CodiceIdRPT } from "./CodiceIdRPT";
import { Importo } from "./Importo";
import { CodiceContestoPagamento } from "./CodiceContestoPagamento";
import * as t from "io-ts";

/**
 * Define the request received from CD App to require a payment activation
 */

// required attributes
const PaymentsActivationRequestR = t.interface({
  codiceIdRPT: CodiceIdRPT,

  importoSingoloVersamento: Importo,

  codiceContestoPagamento: CodiceContestoPagamento
});

// optional attributes
const PaymentsActivationRequestO = t.partial({});

export const PaymentsActivationRequest = t.exact(
  t.intersection(
    [PaymentsActivationRequestR, PaymentsActivationRequestO],
    "PaymentsActivationRequest"
  )
);

export type PaymentsActivationRequest = t.TypeOf<
  typeof PaymentsActivationRequest
>;
