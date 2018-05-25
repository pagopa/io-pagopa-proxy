/**
 * PaymentsCheckResponse
 * Define the response to send to CD App containing payment information
 */

import * as t from "io-ts";

export const PaymentsCheckResponse = t.interface({});
export type PaymentsCheckResponse = t.TypeOf<typeof PaymentsCheckResponse>;
