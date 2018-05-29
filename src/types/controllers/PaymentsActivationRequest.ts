/**
 * PaymentsActivationRequest
 * Define the request received from CD App to require a payment activation
 */

import * as t from "io-ts";
import { WithinRangeString } from "italia-ts-commons/lib/strings";
import { CodiceIdRPT, Importo } from "../CommonTypes";

export const PaymentsActivationRequest = t.interface({
  codiceContestoPagamento: WithinRangeString(1, 35),
  codiceIdRPT: CodiceIdRPT,
  importoSingoloVersamento: Importo
});
export type PaymentsActivationRequest = t.TypeOf<
  typeof PaymentsActivationRequest
>;
