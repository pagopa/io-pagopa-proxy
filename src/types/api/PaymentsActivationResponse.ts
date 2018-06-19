/* tslint:disable:ordered-imports */
/* tslint:disable:no-consecutive-blank-lines */
/* tslint:disable:no-trailing-whitespace */
/* tslint:disable:max-line-length */
/* tslint:disable:jsdoc-format */
/* tslint:disable:interface-name */
/* tslint:disable:no-any */
/* tslint:disable:object-literal-sort-keys */

import { Importo } from "./Importo";
import { Iban } from "./Iban";
import { EnteBeneficiario } from "./EnteBeneficiario";
import { SpezzoniCausaleVersamento } from "./SpezzoniCausaleVersamento";
import * as t from "io-ts";
import { WithinRangeString } from "italia-ts-commons/lib/strings";

/**
 * Define the response to send to CD App containing payment information
 */

// required attributes
const PaymentsActivationResponseR = t.interface({
  importoSingoloVersamento: Importo
});

// optional attributes
const PaymentsActivationResponseO = t.partial({
  ibanAccredito: Iban,

  causaleVersamento: WithinRangeString(1, 140),

  enteBeneficiario: EnteBeneficiario,

  spezzoniCausaleVersamento: SpezzoniCausaleVersamento
});

export const PaymentsActivationResponse = t.exact(
  t.intersection(
    [PaymentsActivationResponseR, PaymentsActivationResponseO],
    "PaymentsActivationResponse"
  )
);

export type PaymentsActivationResponse = t.TypeOf<
  typeof PaymentsActivationResponse
>;
