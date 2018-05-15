/**
 * LoginResponse Types
 * Define response interfaces used by PagoPaAPI for Login services
 */

import { IRestfulObject } from "../../types/BaseResponseApp";

export interface ILoginResponse extends IRestfulObject {
  readonly apiRequestToken: string;
  readonly user: IUser;
}

export interface ILoginAnonymousResponse extends IRestfulObject {
  readonly apiRequestToken: string;
  readonly approveTerms: IApproveTerms;
}

export interface IUser extends IRestfulObject {
  readonly acceptTerms: boolean;
  readonly cellphone: string;
  readonly email: string;
  readonly name: string;
  readonly puk: string;
  readonly spidToken: string;
  readonly surname: string;
  readonly temporaryCellphone: string;
  readonly username: string;
}

export interface IApproveTerms extends IRestfulObject {
  readonly type: string;
  readonly properties: IProperties2;
  readonly title: string;
}

export interface IProperties2 extends IRestfulObject {
  readonly privacy: string;
  readonly terms: string;
}
