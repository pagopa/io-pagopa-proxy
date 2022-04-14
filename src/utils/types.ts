import * as t from "io-ts";
import {
  IResponseType,
  TypeofApiParams,
  TypeofApiResponse
} from "@pagopa/ts-commons/lib/requests";
import {
  HttpStatusCodeEnum,
  IResponse,
  IResponseErrorNotFound,
  IResponseErrorValidation,
  IResponseSuccessJson,
  ProblemJson
} from "@pagopa/ts-commons/lib/responses";
import { WithinRangeInteger } from "@pagopa/ts-commons/lib/numbers";
import { PaymentFaultEnum } from "../../generated/api/PaymentFault";
import { PaymentFaultV2Enum } from "../../generated/api/PaymentFaultV2";
import { PaymentProblemJson } from "../../generated/api/PaymentProblemJson";
import {
  PartyTimeoutFault,
  PartyTimeoutFaultEnum
} from "../../generated/api/PartyTimeoutFault";
import { PartyTimeoutFaultPaymentProblemJson } from "../../generated/api/PartyTimeoutFaultPaymentProblemJson";
import { PartyConfigurationFaultPaymentProblemJson } from "../../generated/api/PartyConfigurationFaultPaymentProblemJson";
import { GatewayFaultPaymentProblemJson } from "../../generated/api/GatewayFaultPaymentProblemJson";
import { PartyConnectionFaultPaymentProblemJson } from "../../generated/api/PartyConnectionFaultPaymentProblemJson";
import { RptId } from "./pagopa";

export type AsControllerResponseType<T> = T extends IResponseType<200, infer R>
  ? IResponseSuccessJson<R>
  : T extends IResponseType<400, PartyConfigurationFaultPaymentProblemJson>
  ? IResponseErrorValidation
  : T extends IResponseType<404, ProblemJson>
  ? IResponseErrorNotFound
  : T extends IResponseType<502, GatewayFaultPaymentProblemJson>
  ? IResponsePaymentInternalError
  : T extends IResponseType<504, PartyTimeoutFaultPaymentProblemJson>
  ? IResponseErrorGatewayTimeout
  : T extends IResponseType<598, PartyConnectionFaultPaymentProblemJson>
  ? IResponseErrorGatewayTimeout
  : never;

export type AsControllerFunction<T> = (
  params: TypeofApiParams<T>
) => Promise<AsControllerResponseType<TypeofApiResponse<T>>>;

export type IResponsePaymentInternalError = IResponse<"IResponseErrorInternal">;

type HttpCode = number & WithinRangeInteger<100, 599>;

/**
 * Returns a 502 with json response.
 */
export const ResponsePaymentError = (
  detail: PaymentFaultEnum,
  detailV2: PaymentFaultV2Enum
): IResponsePaymentInternalError => {
  const problem: PaymentProblemJson = {
    detail,
    detail_v2: detailV2,
    status: HttpStatusCodeEnum.HTTP_STATUS_502 as HttpCode,
    title: "pagoPA service error"
  };
  return {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    apply: res =>
      res
        .status(HttpStatusCodeEnum.HTTP_STATUS_502)
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
export const ResponseErrorGatewayTimeout: (
  detail?: PartyTimeoutFault
) => IResponseErrorGatewayTimeout = detail => ({
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  apply: res => {
    const problem: PartyTimeoutFaultPaymentProblemJson = {
      detail: PaymentFaultEnum.GENERIC_ERROR,
      detail_v2: detail ?? PartyTimeoutFaultEnum.PPT_STAZIONE_INT_PA_TIMEOUT,
      status: HttpStatusCodeEnum.HTTP_STATUS_504 as HttpCode,
      title: "pagoPA service error"
    };

    res
      .status(HttpStatusCodeEnum.HTTP_STATUS_504)
      .set("Content-Type", "application/problem+json")
      .json(problem);
  },
  kind: "IResponseErrorGatewayTimeout"
});

const GeneralRptId = t.interface({
  asObject: RptId,
  asString: t.string
});

export type GeneralRptId = t.TypeOf<typeof GeneralRptId>;
