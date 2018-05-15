/**
 * TransactionResponse Types
 * Define response interfaces used by PagoPaAPI for Transaction services
 */

import * as t from "io-ts";
import { Properties } from "./BaseResponse";

export const Transaction = t.intersection([
  t.interface({
    amount: Properties,
    created: t.string,
    description: t.string,
    error: t.boolean,
    fee: Properties,
    id: t.number,
    merchant: t.string,
    statusMessage: t.string,
    updated: t.string
  }),
  t.partial({
    grandTotal: Properties,
    idPsp: t.string,
    idStatus: t.string,
    idWallet: t.string,
    paymentModel: t.string,
    success: t.string,
    token: t.string,
    urlCheckout3ds: t.string,
    urlRedirectPSP: t.string
  })
]);
export type Transaction = t.TypeOf<typeof Transaction>;

export const TransactionListResponse = t.interface({
  size: t.number,
  start: t.number,
  total: t.number,
  data: t.array(Transaction)
});
export type TransactionListResponse = t.TypeOf<typeof TransactionListResponse>;
