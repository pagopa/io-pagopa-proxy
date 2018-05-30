/**
 * NotificationsDispatchRequest
 * Define the request to send to CD Avvisi API to notify a new notification
 */

import * as t from "io-ts";
import { DateFromString } from "italia-ts-commons/lib/dates";
import {
  PatternString,
  WithinRangeString
} from "italia-ts-commons/lib/strings";
import { Importo } from "../CommonTypes";

export const NotificationsDispatchRequest = t.interface({
  anagraficaBeneficiario: WithinRangeString(1, 35),
  tassonomiaAvviso: t.keyof({
    CARTELLE_ESATTORIALI: 0,
    DIRITTI_CONCESSIONI: 1,
    IMPOSTE_TASSE: 2,
    IMU_TASI_TASSE_COMUNALI: 3,
    INGRESSO_MOSTRE_MUSEI: 4,
    MULTE_SANZIONI_AMMINISTRATIVE: 5,
    PREVIDENZA_INFORTUNI: 6,
    SERVIZI_EROGATI_COMUNE: 7,
    SERVIZI_EROGATI_ALTRI_ENTI: 8,
    SERVIZI_SCOLASTICI: 9,
    TASSA_AUTOMOBILISTICA: 10,
    TICKET_PRESTAZIONI_SANITARIE: 11,
    TRASPORTI_MOBILITA_PARCHEGGI: 12
  }),
  codiceAvviso: PatternString("[0-9]{18}"),
  codiceIdentificativoUnivoco: WithinRangeString(1, 35),
  dataScadenzaPagamento: DateFromString,
  importoAvviso: Importo,
  descrizionePagamento: WithinRangeString(1, 140)
});
export type NotificationsDispatchRequest = t.TypeOf<
  typeof NotificationsDispatchRequest
>;
