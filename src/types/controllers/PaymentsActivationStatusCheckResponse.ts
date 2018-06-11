/**
 * PaymentsActivationStatusCheckResponse
 * Define the response to send to App to provide the payment activation status related to a codiceContestoPagamento
 */

import * as t from "io-ts";
import { WithinRangeString } from "italia-ts-commons/lib/strings";

export const PaymentsActivationStatusCheckResponse = t.interface({
  codiceContestoPagamento: WithinRangeString(1, 35),
  idPagamento: WithinRangeString(1, 35)
});
export type PaymentsActivationStatusCheckResponse = t.TypeOf<
  typeof PaymentsActivationStatusCheckResponse
>;
