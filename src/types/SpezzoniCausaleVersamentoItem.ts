/* tslint:disable:ordered-imports */
/* tslint:disable:no-consecutive-blank-lines */
/* tslint:disable:no-trailing-whitespace */
/* tslint:disable:max-line-length */
/* tslint:disable:jsdoc-format */
/* tslint:disable:interface-name */
/* tslint:disable:no-any */
/* tslint:disable:object-literal-sort-keys */

import { SpezzoneStrutturatoCausaleVersamento } from "./SpezzoneStrutturatoCausaleVersamento";
import * as t from "io-ts";
import { WithinRangeString } from "italia-ts-commons/lib/strings";

// required attributes
const SpezzoniCausaleVersamentoItemR = t.interface({});

// optional attributes
const SpezzoniCausaleVersamentoItemO = t.partial({
  spezzoneCausaleVersamento: WithinRangeString(1, 35),

  spezzoneStrutturatoCausaleVersamento: SpezzoneStrutturatoCausaleVersamento
});

export const SpezzoniCausaleVersamentoItem = t.exact(
  t.intersection(
    [SpezzoniCausaleVersamentoItemR, SpezzoniCausaleVersamentoItemO],
    "SpezzoniCausaleVersamentoItem"
  )
);

export type SpezzoniCausaleVersamentoItem = t.TypeOf<
  typeof SpezzoniCausaleVersamentoItem
>;
