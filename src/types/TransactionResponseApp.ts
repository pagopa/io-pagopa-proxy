/**
 * Transaction Response Types
 * Define response interfaces used by controllers for Transaction services
 */

import * as t from "io-ts";

export const TransactionApp = t.interface({
  id: t.number,
  created: t.string,
  statusMessage: t.string,
  error: t.boolean,
  currency: t.string,
  amount: t.number,
  amountDecimalDigit: t.number,
  merchant: t.string
});
export type TransactionApp = t.TypeOf<typeof TransactionApp>;

export const TransactionListResponseApp = t.interface({
  total: t.number,
  size: t.number,
  start: t.number,
  transactions: t.array(TransactionApp)
});
export type TransactionListResponseApp = t.TypeOf<
  typeof TransactionListResponseApp
>;
