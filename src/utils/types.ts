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
import {
  PartyTimeoutFault,
  PartyTimeoutFaultEnum
} from "../../generated/api/PartyTimeoutFault";
import { PartyTimeoutFaultPaymentProblemJson } from "../../generated/api/PartyTimeoutFaultPaymentProblemJson";
import { PartyConfigurationFaultPaymentProblemJson } from "../../generated/api/PartyConfigurationFaultPaymentProblemJson";
import { GatewayFaultPaymentProblemJson } from "../../generated/api/GatewayFaultPaymentProblemJson";
import { GatewayFaultEnum } from "../../generated/api/GatewayFault";
import { ValidationFaultPaymentProblemJson } from "../../generated/api/ValidationFaultPaymentProblemJson";
import { PartyConfigurationFaultEnum } from "../../generated/api/PartyConfigurationFault";
import { PaymentStatusFaultPaymentProblemJson } from "../../generated/api/PaymentStatusFaultPaymentProblemJson";
import { PaymentStatusFault } from "../../generated/api/PaymentStatusFault";
import { ValidationFaultEnum } from "../../generated/api/ValidationFault";
import { RptId } from "./pagopa";

export type AsControllerResponseType<T> = T extends IResponseType<200, infer R>
  ? IResponseSuccessJson<R>
  : T extends IResponseType<400, ProblemJson>
  ? IResponseErrorValidation
  : T extends IResponseType<404, ValidationFaultPaymentProblemJson>
  ? IResponseErrorValidationFault
  : T extends IResponseType<409, PaymentStatusFaultPaymentProblemJson>
  ? IResponsePaymentStatusFaultError
  : T extends IResponseType<404, ProblemJson>
  ? IResponseErrorNotFound
  : T extends IResponseType<502, GatewayFaultPaymentProblemJson>
  ? IResponseGatewayError
  : T extends IResponseType<503, PartyConfigurationFaultPaymentProblemJson>
  ? IResponsePartyConfigurationError
  : T extends IResponseType<504, PartyTimeoutFaultPaymentProblemJson>
  ? IResponseGatewayTimeout
  : never;

export type AsControllerFunction<T> = (
  params: TypeofApiParams<T>
) => Promise<AsControllerResponseType<TypeofApiResponse<T>>>;

type HttpCode = number & WithinRangeInteger<100, 599>;

export type IResponsePaymentStatusFaultError = IResponse<
  "IResponsePaymentStatusFaultError"
>;

/**
 * Returns a 409 with json response.
 */
export const ResponsePaymentStatusFaultError = (
  category: PaymentFaultEnum,
  detail: PaymentFaultEnum,
  detailV2: PaymentStatusFault
): IResponsePaymentStatusFaultError => {
  const problem: PaymentStatusFaultPaymentProblemJson = {
    category,
    detail,
    detail_v2: detailV2,
    status: HttpStatusCodeEnum.HTTP_STATUS_409 as HttpCode,
    title: "Conflicting payment status"
  };
  return {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    apply: res =>
      res
        .status(HttpStatusCodeEnum.HTTP_STATUS_409)
        // eslint-disable-next-line sonarjs/no-duplicate-string
        .set("Content-Type", "application/problem+json")
        .json(problem),
    kind: "IResponsePaymentStatusFaultError"
  };
};

export type IResponsePartyConfigurationError = IResponse<
  "IResponsePartyConfigurationError"
>;

/**
 * Returns a 503 with json response.
 */
export const ResponsePartyConfigurationError = (
  category: PaymentFaultEnum,
  detail: PaymentFaultEnum,
  detailV2: PartyConfigurationFaultEnum
): IResponsePartyConfigurationError => {
  const problem: PartyConfigurationFaultPaymentProblemJson = {
    category,
    detail,
    detail_v2: detailV2,
    status: HttpStatusCodeEnum.HTTP_STATUS_503 as HttpCode,
    title: "EC service error"
  };
  return {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    apply: res =>
      res
        .status(HttpStatusCodeEnum.HTTP_STATUS_503)
        // eslint-disable-next-line sonarjs/no-duplicate-string
        .set("Content-Type", "application/problem+json")
        .json(problem),
    kind: "IResponsePartyConfigurationError"
  };
};

export type IResponseErrorValidationFault = IResponse<
  "IResponseErrorValidationFault"
>;

export const ResponseErrorValidationFault: (
  category: PaymentFaultEnum,
  detail: PaymentFaultEnum,
  detail_v2: ValidationFaultEnum
) => IResponseErrorValidationFault = (category, detail, detailV2) => {
  const problem: ValidationFaultPaymentProblemJson = {
    category,
    detail,
    detail_v2: detailV2,
    status: HttpStatusCodeEnum.HTTP_STATUS_404 as HttpCode,
    // eslint-disable-next-line sonarjs/no-duplicate-string
    title: "pagoPA service error"
  };

  return {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    apply: res =>
      res
        .status(HttpStatusCodeEnum.HTTP_STATUS_404)
        // eslint-disable-next-line sonarjs/no-duplicate-string
        .set("Content-Type", "application/problem+json")
        .json(problem),
    kind: "IResponseErrorValidationFault"
  };
};

export type IResponseGatewayError = IResponse<"IResponseGatewayError">;

/**
 * Returns a 502 with json response.
 */
export const ResponsePaymentError = (
  category: PaymentFaultEnum,
  detail: PaymentFaultEnum,
  detailV2: GatewayFaultEnum
): IResponseGatewayError => {
  const problem: GatewayFaultPaymentProblemJson = {
    category,
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
        // eslint-disable-next-line sonarjs/no-duplicate-string
        .set("Content-Type", "application/problem+json")
        .json(problem),
    kind: "IResponseGatewayError"
  };
};

export type IResponseGatewayTimeout = IResponse<"IResponseErrorGatewayTimeout">;

/**
 * Returns a 504 response
 */
export const ResponseGatewayTimeout: (
  detail?: PartyTimeoutFault
) => IResponseGatewayTimeout = detail => ({
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  apply: res => {
    const problem: PartyTimeoutFaultPaymentProblemJson = {
      category: PaymentFaultEnum.GENERIC_ERROR,
      detail: PaymentFaultEnum.GENERIC_ERROR,
      detail_v2: detail ?? PartyTimeoutFaultEnum.GENERIC_ERROR,
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
