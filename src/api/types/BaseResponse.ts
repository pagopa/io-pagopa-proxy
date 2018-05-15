/**
 * BaseResponse Types
 * Provide common types shared with PagoPaAPI used for communications
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

export interface IProperties extends IRestfulObject {
  readonly amount: number;
  readonly currency: string;
  readonly decimalDigits: number;
}
