/**
 * PaymentsCheckRequest
 * Define the request received from CD App to require a payment (RPT) check
 */

import * as t from "io-ts";
import { CodiceIdRPT } from "../CommonTypes";

export const PaymentsCheckRequest = t.interface({
  codiceIdRPT: CodiceIdRPT
});
export type PaymentsCheckRequest = t.TypeOf<typeof PaymentsCheckRequest>;
