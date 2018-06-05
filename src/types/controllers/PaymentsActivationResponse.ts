/**
 * PaymentsActivationResponse
 * Define the response to send to CD App containing payment information
 */

import * as t from "io-ts";
import {
  PatternString,
  WithinRangeString
} from "italia-ts-commons/lib/strings";
import { Iban, Importo } from "../CommonTypes";

export const PaymentsActivationResponse = t.intersection([
  t.interface({
    importoSingoloVersamento: Importo
  }),
  t.partial({
    ibanAccredito: Iban,
    causaleVersamento: WithinRangeString(1, 140),
    enteBeneficiario: t.interface({
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
    }),
    spezzoniCausaleVersamento: t.array(
      t.interface({
        spezzoneCausaleVersamento: WithinRangeString(1, 35),
        spezzoneStrutturatoCausaleVersamento: t.interface({
          causaleSpezzone: WithinRangeString(1, 25),
          importoSpezzone: Importo
        })
      })
    )
  })
]);
export type PaymentsActivationResponse = t.TypeOf<
  typeof PaymentsActivationResponse
>;
