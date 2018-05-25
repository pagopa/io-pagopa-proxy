/**
 * PaymentsStatusUpdateRequest
 * Define the request to send to CD App to notify a payment status update
 */

import * as t from "io-ts";

export const PaymentsStatusUpdateRequest = t.interface({});
export type PaymentsStatusUpdateRequest = t.TypeOf<
  typeof PaymentsStatusUpdateRequest
>;
