/**
 * StatusCode Enumerator
 * Define http codes returned by controllers
 */

import * as t from "io-ts";
import { HttpStatusCodeEnum } from "italia-ts-commons/lib/responses";

export const HttpErrorStatusCode = t.keyof({
  BAD_REQUEST: HttpStatusCodeEnum.HTTP_STATUS_400,
  FORBIDDEN: HttpStatusCodeEnum.HTTP_STATUS_403,
  NOT_FOUND: HttpStatusCodeEnum.HTTP_STATUS_404,
  CONFLICT: HttpStatusCodeEnum.HTTP_STATUS_409,
  INTERNAL_ERROR: HttpStatusCodeEnum.HTTP_STATUS_500
});
export type HttpErrorStatusCode = t.TypeOf<typeof HttpErrorStatusCode>;
