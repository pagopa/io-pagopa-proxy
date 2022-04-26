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
  IResponseErrorValidationFault,
  ResponseGatewayTimeout,
  ResponsePartyConfigurationError,
  ResponsePaymentError
} from "./types";
import { logger } from "./Logger";

export const ResponseErrorValidationFault: (
  title: string,
  detail: ValidationFaultEnum
) => IResponseErrorValidationFault = (title, detail) => {
  // eslint-disable-next-line functional/no-let
  let responseDetail;
  if (typeof detail === "string") {
    responseDetail = `${title}: ${detail}`;
  } else {
    responseDetail = detail;
  }
  return {
    ...ResponseErrorGeneric(HttpStatusCodeEnum.HTTP_STATUS_404, title, detail),
    detail: responseDetail,
    kind: "IResponseErrorValidationFault"
  };
};

export const responseFromPaymentFault: (
  detail: PaymentFaultEnum,
  detail_v2: PaymentFaultV2Enum
) =>
  | IResponsePartyConfigurationError
  | IResponseErrorValidationFault
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
    return ResponseErrorValidationFault(
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
