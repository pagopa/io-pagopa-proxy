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
import { PatternString } from "italia-ts-commons/lib/strings";

// required attributes
const EnteBeneficiarioR = t.interface({
  identificativoUnivocoBeneficiario: WithinRangeString(1, 35),

  denominazioneBeneficiario: WithinRangeString(1, 70),

  codiceUnitOperBeneficiario: WithinRangeString(1, 35),

  denomUnitOperBeneficiario: WithinRangeString(1, 70),

  indirizzoBeneficiario: WithinRangeString(1, 70),

  civicoBeneficiario: WithinRangeString(1, 16),

  capBeneficiario: WithinRangeString(1, 16),

  localitaBeneficiario: WithinRangeString(1, 35),

  provinciaBeneficiario: WithinRangeString(1, 35),

  nazioneBeneficiario: PatternString("[A-Z]{2,2}")
});

// optional attributes
const EnteBeneficiarioO = t.partial({});

export const EnteBeneficiario = t.exact(
  t.intersection([EnteBeneficiarioR, EnteBeneficiarioO], "EnteBeneficiario")
);

export type EnteBeneficiario = t.TypeOf<typeof EnteBeneficiario>;
