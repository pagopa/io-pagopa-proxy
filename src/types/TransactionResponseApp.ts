/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 */

import { IRestfulObject } from "./BaseResponseApp";

export interface ITransactionListResponseApp extends IRestfulObject {
  readonly total: number;
  readonly size: number;
  readonly start: number;
  readonly transactions: ReadonlyArray<ITransactionApp>;
}

export interface ITransactionApp extends IRestfulObject {
  readonly id: number;
  readonly created: string;
  readonly statusMessage: string;
  readonly error: boolean;
  readonly currency: string;
  readonly amount: number;
  readonly amountDecimalDigit: number;
  readonly merchant: string;
}
