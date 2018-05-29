/**
 * NotificationsDispatchRequest
 * Define the request to send to CD Avvisi API to notify a new notification
 */

import * as t from "io-ts";
import { DateFromString } from "italia-ts-commons/lib/dates";
import {
  EmailString,
  PatternString,
  WithinRangeString
} from "italia-ts-commons/lib/strings";
import { Iban, Importo } from "../CommonTypes";

export const NotificationsDispatchRequest = t.interface({
  identificativoDominio: WithinRangeString(1, 35),
  anagraficaBeneficiario: WithinRangeString(1, 35),
  identificativoMessaggioRichiesta: WithinRangeString(1, 20),
  tassonomiaAvviso: t.keyof({
    "00": "Cartelle Esattoriali",
    "01": "Diritti e Concessioni",
    "02": "Imposte e Tasse",
    "03": "Imu tasi e altre tasse comunali",
    "04": "Ingressi a mostre e musei",
    "05": "Multe e sanzioni amministrative",
    "06": "Previdenza e infortuni",
    "07": "Servizi erogati dal comune",
    "08": "Servizi erogati da altri enti",
    "09": "Servizi scolastici",
    "10": "Tassa automobilistica",
    "11": "Ticket e prestazioni sanitarie",
    "12": "Trasporti, mobilità e parcheggi"
  }),
  codiceAvviso: PatternString("[0-9]{18}"),
  dataScadenzaPagamento: DateFromString,
  dataScadenzaAvviso: DateFromString,
  importoAvviso: Importo,
  eMailSoggetto: EmailString,
  descrizionePagamento: WithinRangeString(1, 140),
  datiSingoloVersamento: t.array(
    t.partial({
      ibanAccredito: Iban,
      ibanAppoggio: Iban
    })
  )
});
export type NotificationsDispatchRequest = t.TypeOf<
  typeof NotificationsDispatchRequest
>;
