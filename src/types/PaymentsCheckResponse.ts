/* tslint:disable:ordered-imports */
/* tslint:disable:no-consecutive-blank-lines */
/* tslint:disable:no-trailing-whitespace */
/* tslint:disable:max-line-length */
/* tslint:disable:jsdoc-format */
/* tslint:disable:interface-name */
/* tslint:disable:no-any */
/* tslint:disable:object-literal-sort-keys */

import { Importo } from "./Importo";
import { CodiceContestoPagamento } from "./CodiceContestoPagamento";
import { Iban } from "./Iban";
import { EnteBeneficiario } from "./EnteBeneficiario";
import { SpezzoniCausaleVersamento } from "./SpezzoniCausaleVersamento";
import * as t from "io-ts";
import { WithinRangeString } from "italia-ts-commons/lib/strings";

/**
 * Define the response to send to CD App containing payment information
 */

// required attributes
const PaymentsCheckResponseR = t.interface({
  importoSingoloVersamento: Importo,

  codiceContestoPagamento: CodiceContestoPagamento
});

// optional attributes
const PaymentsCheckResponseO = t.partial({
  ibanAccredito: Iban,

  causaleVersamento: WithinRangeString(1, 140),

  enteBeneficiario: EnteBeneficiario,

  spezzoniCausaleVersamento: SpezzoniCausaleVersamento
});

export const PaymentsCheckResponse = t.exact(
  t.intersection(
    [PaymentsCheckResponseR, PaymentsCheckResponseO],
    "PaymentsCheckResponse"
  )
);

export type PaymentsCheckResponse = t.TypeOf<typeof PaymentsCheckResponse>;
