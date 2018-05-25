/**
 * ReceiptsDispatcherRequest
 * Define the request to send to CD Avvisi API contaning a receipt
 */

import * as t from "io-ts";

export const ReceiptsDispatchRequest = t.interface({});
export type ReceiptsDispatchRequest = t.TypeOf<typeof ReceiptsDispatchRequest>;
