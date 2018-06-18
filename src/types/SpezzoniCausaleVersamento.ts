/* tslint:disable:ordered-imports */
/* tslint:disable:no-consecutive-blank-lines */
/* tslint:disable:no-trailing-whitespace */
/* tslint:disable:max-line-length */
/* tslint:disable:jsdoc-format */
/* tslint:disable:interface-name */
/* tslint:disable:no-any */
/* tslint:disable:object-literal-sort-keys */

import * as t from "io-ts";
import { SpezzoniCausaleVersamentoItem } from "./SpezzoniCausaleVersamentoItem";

export type SpezzoniCausaleVersamento = t.TypeOf<
  typeof SpezzoniCausaleVersamento
>;
export const SpezzoniCausaleVersamento = t.readonlyArray(
  SpezzoniCausaleVersamentoItem,
  "array of SpezzoniCausaleVersamentoItem"
);
