import { errorsToReadableMessages } from "@pagopa/ts-commons/lib/reporters";
import * as t from "io-ts";
import {
  HttpStatusCodeEnum,
  ResponseErrorGeneric
} from "@pagopa/ts-commons/lib/responses";
import { PartyConfigurationFaultEnum } from "../../generated/api/PartyConfigurationFault";
import { PartyTimeoutFault } from "../../generated/api/PartyTimeoutFault";
import { PaymentFaultEnum } from "../../generated/api/PaymentFault";
import { PaymentFaultV2Enum } from "../../generated/api/PaymentFaultV2";
import { GatewayFaultEnum } from "../../generated/api/GatewayFault";
import { PartyConnectionFaultEnum } from "../../generated/api/PartyConnectionFault";
import {
  IResponseGatewayError,
  IResponseGatewayTimeout,
  IResponsePartyConfigurationError,
  IResponseProxyConnectionError,
  ResponseGatewayTimeout,
  ResponsePaymentError,
  ResponseProxyConnectionError
} from "./types";

export const ResponseErrorValidation: (
  title: string,
  detail: string | PartyConfigurationFaultEnum
) => IResponsePartyConfigurationError = (title, detail) => {
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
    kind: "IResponsePartyConfigurationError"
  };
};

export const ResponseErrorFromValidationErrors: <S, A>(
  type: t.Type<A, S, unknown>
) => (
  errors: ReadonlyArray<t.ValidationError>
) => // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
IResponsePartyConfigurationError = type => errors => {
  const detail = errorsToReadableMessages(errors).join("\n");
  return ResponseErrorValidation(`Invalid ${type.name}`, detail);
};

export const responseFromPaymentFault: (
  detail: PaymentFaultEnum,
  detail_v2: PaymentFaultV2Enum
) =>
  | IResponsePartyConfigurationError
  | IResponseGatewayError
  | IResponseGatewayTimeout
  | IResponseProxyConnectionError = (detail, detail_v2) => {
  if (
    Object.values(PartyConfigurationFaultEnum).includes(
      (detail_v2 as unknown) as PartyConfigurationFaultEnum
    )
  ) {
    return ResponseErrorValidation(
      detail,
      (detail_v2 as unknown) as PartyConfigurationFaultEnum
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
    Object.values(PartyTimeoutFault).includes(
      (detail_v2 as unknown) as PartyTimeoutFault
    )
  ) {
    return ResponseGatewayTimeout((detail_v2 as unknown) as PartyTimeoutFault);
  } else if (
    Object.values(PartyConnectionFaultEnum).includes(
      (detail_v2 as unknown) as PartyConnectionFaultEnum
    )
  ) {
    return ResponseProxyConnectionError(
      (detail_v2 as unknown) as PartyConnectionFaultEnum
    );
  } else {
    throw new Error("unmapped payment fault v2");
  }
};
