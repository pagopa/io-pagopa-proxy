/**
 * PaymentsStatusUpdateRequest
 * Define the request to send to CD App to notify a payment status update
 */

import * as t from "io-ts";

// TODO: [#157910884] Waiting SIA specs
export const PaymentsStatusUpdateRequest = t.interface({});
export type PaymentsStatusUpdateRequest = t.TypeOf<
  typeof PaymentsStatusUpdateRequest
>;
