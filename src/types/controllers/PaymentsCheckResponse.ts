/**
 * PaymentsCheckResponse
 * Define the response to send to CD App containing payment information
 */

import * as t from "io-ts";
import { WithinRangeString } from "italia-ts-commons/lib/strings";
import { BIC, Iban, Importo } from "../CommonTypes";

export const PaymentsCheckResponse = t.intersection([
  t.interface({
    importoSingoloVersamento: Importo
  }),
  t.partial({
    ibanAccredito: Iban,
    bicAccredito: BIC,
    denominazioneBeneficiario: WithinRangeString(1, 70),
    causaleVersamento: WithinRangeString(1, 140),
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
export type PaymentsCheckResponse = t.TypeOf<typeof PaymentsCheckResponse>;
