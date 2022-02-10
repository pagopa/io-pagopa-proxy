import * as t from "io-ts";
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
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/lib/function";
import { WithinRangeInteger } from "@pagopa/ts-commons/lib/numbers";
import { PaymentFaultEnum } from "../../generated/api/PaymentFault";
import { PaymentFaultV2Enum } from "../../generated/api/PaymentFaultV2";
import { PaymentProblemJson } from "../../generated/api/PaymentProblemJson";
import { RptId } from "./pagopa";

export type AsControllerResponseType<T> = T extends IResponseType<200, infer R>
  ? IResponseSuccessJson<R>
  : T extends IResponseType<400, ProblemJson>
  ? IResponseErrorValidation
  : T extends IResponseType<404, ProblemJson>
  ? IResponseErrorNotFound
  : T extends IResponseType<500, ProblemJson>
  ? IResponseErrorInternal
  : T extends IResponseType<424, PaymentProblemJson>
  ? IResponsePaymentInternalError
  : never;

export type AsControllerFunction<T> = (
  params: TypeofApiParams<T>
) => Promise<AsControllerResponseType<TypeofApiResponse<T>>>;

export type IResponsePaymentInternalError = IResponse<"IResponseErrorInternal">;

/**
 * Returns a 424 with json response.
 */
export const ResponsePaymentError = (
  detail: PaymentFaultEnum,
  detailV2: PaymentFaultV2Enum
): IResponsePaymentInternalError => {
  const problem: PaymentProblemJson = {
    detail,
    detail_v2: detailV2,
    status: pipe(
      WithinRangeInteger(100, 599).decode(HttpStatusCodeEnum.HTTP_STATUS_424),
      E.getOrElseW(() => {
        throw new Error("should never happen: invalid HTTP status code");
      })
    ),
    title: "Internal service error"
  };
  return {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    apply: res =>
      res
        .status(HttpStatusCodeEnum.HTTP_STATUS_424)
        .set("Content-Type", "application/problem+json")
        .json(problem),
    kind: "IResponseErrorInternal"
  };
};

const GeneralRptId = t.interface({
  asObject: RptId,
  asString: t.string
});

export type GeneralRptId = t.TypeOf<typeof GeneralRptId>;
