import * as t from "io-ts";
import { RptId } from "@pagopa/io-pagopa-commons/lib/pagopa";
import {
  IResponseType,
  TypeofApiParams,
  TypeofApiResponse
} from "@pagopa/ts-commons/lib/requests";
import {
  HttpStatusCodeEnum,
  IResponse,
  IResponseErrorInternal,
  IResponseErrorNotFound,
  IResponseErrorValidation,
  IResponseSuccessJson,
  ProblemJson
} from "@pagopa/ts-commons/lib/responses";
import { PaymentFaultEnum } from "../../generated/api/PaymentFault";
import { PaymentFaultV2Enum } from "../../generated/api/PaymentFaultV2";
import { PaymentProblemJson } from "../../generated/api/PaymentProblemJson";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/lib/function";
import { WithinRangeInteger } from "@pagopa/ts-commons/lib/numbers";

export type AsControllerResponseType<T> = T extends IResponseType<200, infer R>
  ? IResponseSuccessJson<R>
  : T extends IResponseType<400, ProblemJson>
  ? IResponseErrorValidation
  : T extends IResponseType<404, ProblemJson>
  ? IResponseErrorNotFound
  : T extends IResponseType<500, ProblemJson>
  ? IResponseErrorInternal
  : T extends IResponseType<500, PaymentProblemJson>
  ? IResponsePaymentInternalError
  : never;

export type AsControllerFunction<T> = (
  params: TypeofApiParams<T>
) => Promise<AsControllerResponseType<TypeofApiResponse<T>>>;

export type IResponsePaymentInternalError = IResponse<"IResponseErrorInternal">;

/**
 * Returns a 500 with json response.
 */
export const ResponsePaymentError = (
  detail: PaymentFaultEnum,
  detailV2: PaymentFaultV2Enum
): IResponsePaymentInternalError => {
  const problem: PaymentProblemJson = {
    status: pipe(
      WithinRangeInteger(100, 599).decode(HttpStatusCodeEnum.HTTP_STATUS_500),
      E.getOrElseW(e => { throw new Error("should never happen: invalid HTTP status code") })
    ), // FIXME: Why doesn't direct usage of `HttpStatusCodeEnum.HTTP_STATUS_500` typecheck correctly?
    title: "Internal server error",
    detail,
    detail_v2: detailV2
  };
  return {
    apply: res =>
      res
        .status(HttpStatusCodeEnum.HTTP_STATUS_500)
        .set("Content-Type", "application/problem+json")
        .json(problem),
    kind: "IResponseErrorInternal"
  };
};

const GeneralRptId = t.interface({
  asString: t.string,
  asObject: RptId
});

export type GeneralRptId = t.TypeOf<typeof GeneralRptId>;
