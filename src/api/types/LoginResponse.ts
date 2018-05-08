/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 */

import { IOs } from "./BaseResponse";

export interface ILoginResponse {
  readonly apiRequestToken: string;
  readonly user: IUser;
}

export interface ILoginAnonymousResponse {
  readonly apiRequestToken: string;
  readonly approveTerms: IApproveTerms;
}

export interface IUser {
  readonly acceptTerms: boolean;
  readonly cellphone: string;
  readonly email: string;
  readonly name: string;
  readonly puk: string;
  readonly spidToken: string;
  readonly status: IOs;
  readonly surname: string;
  readonly temporaryCellphone: string;
  readonly username: string;
}

export interface IApproveTerms {
  readonly type: string;
  readonly properties: IProperties2;
  readonly title: string;
}

export interface IProperties2 {
  readonly privacy: string;
  readonly terms: string;
}
