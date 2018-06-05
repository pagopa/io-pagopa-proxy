/**
 * PaymentsActivationRequest
 * Define the request received from CD App to require a payment activation
 */

import * as t from "io-ts";
import { WithinRangeString } from "italia-ts-commons/lib/strings";
import { CodiceIdRPT, Importo } from "../CommonTypes";

export const PaymentsActivationRequest = t.interface({
  codiceIdRPT: CodiceIdRPT,
  importoSingoloVersamento: Importo,
  codiceContestoPagamento: WithinRangeString(1, 35)
});
export type PaymentsActivationRequest = t.TypeOf<
  typeof PaymentsActivationRequest
>;
