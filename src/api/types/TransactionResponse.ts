/**
 * TransactionResponse Types
 * Define response interfaces used by PagoPaAPI for Transaction services
 */

import { IRestfulObject } from "../../types/BaseResponseApp";
import { IProperties } from "./BaseResponse";

export interface ITransactionListResponse extends IRestfulObject {
  readonly data: ReadonlyArray<ITransaction>;
  readonly size: number;
  readonly start: number;
  readonly total: number;
}

export interface ITransaction extends IRestfulObject {
  readonly amount: IProperties;
  readonly created: string;
  readonly description: string;
  readonly error: boolean;
  readonly fee: IProperties;
  readonly grandTotal?: IProperties;
  readonly id: number;
  readonly idPsp?: string;
  readonly idStatus?: string;
  readonly idWallet?: string;
  readonly merchant: string;
  readonly paymentModel?: string;
  readonly statusMessage: string;
  readonly success?: string;
  readonly token?: string;
  readonly updated: string;
  readonly urlCheckout3ds?: string;
  readonly urlRedirectPSP?: string;
}
