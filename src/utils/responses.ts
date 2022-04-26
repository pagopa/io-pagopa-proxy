import { errorsToReadableMessages } from "@pagopa/ts-commons/lib/reporters";
import * as t from "io-ts";
import {
  HttpStatusCodeEnum,
  ResponseErrorGeneric
} from "@pagopa/ts-commons/lib/responses";
import { PartyConfigurationFaultEnum } from "../../generated/api/PartyConfigurationFault";
import { PartyTimeoutFaultEnum } from "../../generated/api/PartyTimeoutFault";
import { PaymentFaultEnum } from "../../generated/api/PaymentFault";
import { PaymentFaultV2Enum } from "../../generated/api/PaymentFaultV2";
import { GatewayFaultEnum } from "../../generated/api/GatewayFault";
import { ValidationFaultEnum } from "../../generated/api/ValidationFault";
import {
  IResponseGatewayError,
  IResponseGatewayTimeout,
  IResponsePartyConfigurationError,
  IResponseValidationError,
  ResponseGatewayTimeout,
  ResponsePartyConfigurationError,
  ResponsePaymentError
} from "./types";
import { logger } from "./Logger";

export const ResponseErrorValidation: (
  title: string,
  detail: string | ValidationFaultEnum
) => IResponseValidationError = (title, detail) => {
  // eslint-disable-next-line functional/no-let
  let responseDetail;
  if (typeof detail === "string") {
    responseDetail = `${title}: ${detail}`;
  } else {
    responseDetail = detail;
  }
  return {
    ...ResponseErrorGeneric(HttpStatusCodeEnum.HTTP_STATUS_400, title, detail),
    detail: responseDetail,
    kind: "IResponseValidationError"
  };
};

export const ResponseErrorFromValidationErrors: <S, A>(
  type: t.Type<A, S, unknown>
) => (
  errors: ReadonlyArray<t.ValidationError>
) => // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
IResponseValidationError = type => errors => {
  const detail = errorsToReadableMessages(errors).join("\n");
  return ResponseErrorValidation(`Invalid ${type.name}`, detail);
};

export const responseFromPaymentFault: (
  detail: PaymentFaultEnum,
  detail_v2: PaymentFaultV2Enum
) =>
  | IResponsePartyConfigurationError
  | IResponseValidationError
  | IResponseGatewayError
  | IResponseGatewayTimeout = (detail, detail_v2) => {
  if (
    Object.values(PartyConfigurationFaultEnum).includes(
      (detail_v2 as unknown) as PartyConfigurationFaultEnum
    )
  ) {
    return ResponsePartyConfigurationError(
      detail,
      (detail_v2 as unknown) as PartyConfigurationFaultEnum
    );
  } else if (
    Object.values(ValidationFaultEnum).includes(
      (detail_v2 as unknown) as ValidationFaultEnum
    )
  ) {
    return ResponseErrorValidation(
      detail,
      (detail_v2 as unknown) as ValidationFaultEnum
    );
  } else if (
    Object.values(GatewayFaultEnum).includes(
      (detail_v2 as unknown) as GatewayFaultEnum
    )
  ) {
    return ResponsePaymentError(
      detail,
      (detail_v2 as unknown) as GatewayFaultEnum
    );
  } else if (
    Object.values(PartyTimeoutFaultEnum).includes(
      (detail_v2 as unknown) as PartyTimeoutFaultEnum
    )
  ) {
    return ResponseGatewayTimeout(
      (detail_v2 as unknown) as PartyTimeoutFaultEnum
    );
  } else {
    logger.error(`unmapped detail_v2: ${detail_v2}`);
    throw new Error(`unmapped detail_v2: ${detail_v2}`);
  }
};
