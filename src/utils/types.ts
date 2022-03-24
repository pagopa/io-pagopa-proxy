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
  : T extends IResponseType<504, undefined>
  ? IResponseErrorGatewayTimeout
  : never;

export type AsControllerFunction<T> = (
  params: TypeofApiParams<T>
) => Promise<AsControllerResponseType<TypeofApiResponse<T>>>;

export type IResponsePaymentInternalError = IResponse<"IResponseErrorInternal">;

type HttpCode = number & WithinRangeInteger<100, 599>;

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
    status: HttpStatusCodeEnum.HTTP_STATUS_424 as HttpCode,
    title: "pagoPA service error"
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

export type IResponseErrorGatewayTimeout = IResponse<
  "IResponseErrorGatewayTimeout"
>;

/**
 * Returns a 504 response
 */
export const ResponseErrorGatewayTimeout: IResponseErrorGatewayTimeout = {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  apply: res => res.status(HttpStatusCodeEnum.HTTP_STATUS_504).send(),
  kind: "IResponseErrorGatewayTimeout"
};

const GeneralRptId = t.interface({
  asObject: RptId,
  asString: t.string
});

export type GeneralRptId = t.TypeOf<typeof GeneralRptId>;
