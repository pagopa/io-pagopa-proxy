/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 */

import { IRestfulObject } from "../../types/BaseResponseApp";

export interface IData {
  readonly type: string;
  readonly items: ISchema;
}

export interface ISchema extends IRestfulObject {
  readonly $ref: string;
}

export interface IOs extends IRestfulObject {
  readonly type: string;
  readonly enum: ReadonlyArray<string>;
}
