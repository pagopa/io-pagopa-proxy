/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 */

import { IRestfulObject } from "../../types/BaseResponseApp";
import { IOs, ISchema } from "./BaseResponse";

export interface IWalletResponse {
  readonly data: ReadonlyArray<IProperties31>;
}

export interface IProperties31 extends IRestfulObject {
  readonly creditCard: IProperties8;
  readonly favourite: string;
  readonly idPagamentoFromEC: string;
  readonly idPsp: string;
  readonly idWallet: string;
  readonly lastUsage: string;
  readonly psp: IProperties15;
  readonly pspEditable: string;
  readonly type: string;
}

export interface IProperties8 extends IRestfulObject {
  readonly brandLogo: string;
  readonly expireMonth: string;
  readonly expireYear: string;
  readonly flag3dsVerified: string;
  readonly holder: string;
  readonly id: string;
  readonly pan: string;
  readonly securityCode: string;
}

export interface IProperties15 extends IRestfulObject {
  readonly appChannel: string;
  readonly businessName: string;
  readonly cancelled: string;
  readonly fixedCost: ISchema;
  readonly flagStamp: string;
  readonly id: string;
  readonly idCard: string;
  readonly idChannel: string;
  readonly idIntermediary: string;
  readonly idPsp: string;
  readonly lingua: IOs;
  readonly logoPSP: string;
  readonly paymentModel: string;
  readonly paymentType: string;
  readonly serviceAvailability: string;
  readonly serviceDescription: string;
  readonly serviceLogo: string;
  readonly serviceName: string;
  readonly tags: IUserStatusEnum;
  readonly urlInfoChannel: string;
}

export interface IUserStatusEnum extends IRestfulObject {
  readonly type: string;
  readonly items: IOs;
}
