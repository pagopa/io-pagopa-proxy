/**
 * PaymentsCheckRequest
 * Define the request received from CD App to require a payment check
 */

import * as t from "io-ts";

export const PaymentsCheckRequest = t.interface({});
export type PaymentsCheckRequest = t.TypeOf<typeof PaymentsCheckRequest>;
