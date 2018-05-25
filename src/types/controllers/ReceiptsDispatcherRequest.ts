/**
 * ReceiptsDispatcherRequest
 * Define the request to send to CD Avvisi API contaning a receipt
 */

import * as t from "io-ts";

export const ReceiptsDispatcherRequest = t.interface({});
export type ReceiptsDispatcherRequest = t.TypeOf<
  typeof ReceiptsDispatcherRequest
>;
