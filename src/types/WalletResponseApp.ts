/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 */

import { IRestfulObject } from "./BaseResponseApp";

export interface IWalletResponseApp extends IRestfulObject {
  readonly wallet: ReadonlyArray<IPaymentMethodApp>;
}

export interface IPaymentMethodApp extends IRestfulObject {
  readonly idWallet: string;
  readonly type: string;
  readonly favourite: string;
  readonly lastUsage: string;
  readonly pspBusinessName: string;
  readonly pspServiceName: string;
  readonly cardPan?: string;
}
