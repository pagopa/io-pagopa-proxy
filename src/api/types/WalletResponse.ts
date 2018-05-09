/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 */

import { IRestfulObject } from "../../types/BaseResponseApp";
import { IOs, IProperties } from "./BaseResponse";

export interface IWalletResponse extends IRestfulObject {
  readonly data: ReadonlyArray<IPaymentMethod>;
}

export interface IPaymentMethod extends IRestfulObject {
  readonly creditCard?: IProperties8;
  readonly favourite: boolean;
  readonly idPagamentoFromEC?: string;
  readonly idPsp: string;
  readonly idWallet: number;
  readonly lastUsage?: string;
  readonly psp: IProperties15;
  readonly pspEditable: boolean;
  readonly type: string;
}

export interface IProperties8 extends IRestfulObject {
  readonly brandLogo: string;
  readonly expireMonth: string;
  readonly expireYear: string;
  readonly flag3dsVerified?: string;
  readonly holder: string;
  readonly id: number;
  readonly pan: string;
  readonly securityCode?: string;
}

export interface IProperties15 extends IRestfulObject {
  readonly appChannel?: string;
  readonly businessName: string;
  readonly cancelled?: string;
  readonly fixedCost: IProperties;
  readonly flagStamp?: string;
  readonly id?: string;
  readonly idCard?: string;
  readonly idChannel?: string;
  readonly idIntermediary?: string;
  readonly idPsp: string;
  readonly lingua?: IOs;
  readonly logoPSP?: string;
  readonly paymentModel?: number;
  readonly paymentType: string;
  readonly serviceAvailability?: string;
  readonly serviceDescription?: string;
  readonly serviceLogo?: string;
  readonly serviceName: string;
  readonly tags?: IUserStatusEnum;
  readonly urlInfoChannel: string;
}

export interface IUserStatusEnum extends IRestfulObject {
  readonly type: string;
  readonly items: IOs;
}
