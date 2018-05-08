/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 */

import { IRestfulObject } from "../../types/BaseResponseApp";
import { ISchema } from "./BaseResponse";

export interface ITransactionListResponse {
  readonly data: ReadonlyArray<IProperties25>;
  readonly size: number;
  readonly start: number;
  readonly total: number;
}

export interface IProperties25 extends IRestfulObject {
  readonly amount: IProperties;
  readonly created: string;
  readonly description: string;
  readonly error: string;
  readonly fee: ISchema;
  readonly grandTotal: ISchema;
  readonly id: string;
  readonly idPsp: string;
  readonly idStatus: string;
  readonly idWallet: string;
  readonly merchant: string;
  readonly paymentModel: string;
  readonly statusMessage: string;
  readonly success: string;
  readonly token: string;
  readonly updated: string;
  readonly urlCheckout3ds: string;
  readonly urlRedirectPSP: string;
}

export interface IProperties extends IRestfulObject {
  readonly amount: string;
  readonly currency: string;
  readonly currencyNumber: string;
  readonly decimalDigits: string;
}
