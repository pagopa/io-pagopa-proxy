/**
 * PaymentsCheckRequest
 * Define the request received from CD App to require a payment (RPT) check
 */

import * as t from "io-ts";
import { WithinRangeString } from "italia-ts-commons/lib/strings";
import { CodiceIdRPT } from "../CommonTypes";

export const PaymentsCheckRequest = t.interface({
  codiceContestoPagamento: WithinRangeString(1, 35),
  codiceIdRPT: CodiceIdRPT
});
export type PaymentsCheckRequest = t.TypeOf<typeof PaymentsCheckRequest>;
