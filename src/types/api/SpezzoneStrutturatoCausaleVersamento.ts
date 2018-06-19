/* tslint:disable:ordered-imports */
/* tslint:disable:no-consecutive-blank-lines */
/* tslint:disable:no-trailing-whitespace */
/* tslint:disable:max-line-length */
/* tslint:disable:jsdoc-format */
/* tslint:disable:interface-name */
/* tslint:disable:no-any */
/* tslint:disable:object-literal-sort-keys */

import { Importo } from "./Importo";
import * as t from "io-ts";
import { WithinRangeString } from "italia-ts-commons/lib/strings";

/**
 * Amount related to a single element of a payment installments
 */

// required attributes
const SpezzoneStrutturatoCausaleVersamentoR = t.interface({});

// optional attributes
const SpezzoneStrutturatoCausaleVersamentoO = t.partial({
  causaleSpezzone: WithinRangeString(1, 25),

  importoSpezzone: Importo
});

export const SpezzoneStrutturatoCausaleVersamento = t.exact(
  t.intersection(
    [
      SpezzoneStrutturatoCausaleVersamentoR,
      SpezzoneStrutturatoCausaleVersamentoO
    ],
    "SpezzoneStrutturatoCausaleVersamento"
  )
);

export type SpezzoneStrutturatoCausaleVersamento = t.TypeOf<
  typeof SpezzoneStrutturatoCausaleVersamento
>;
