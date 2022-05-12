import {
  HttpStatusCodeEnum,
  ResponseErrorGeneric
} from "@pagopa/ts-commons/lib/responses";
import * as t from "io-ts";
import * as E from "fp-ts/lib/Either";
import * as A from "fp-ts/lib/Array";
import { flow, pipe } from "fp-ts/lib/function";
import { PartyConfigurationFault } from "../../generated/api/PartyConfigurationFault";
import { PartyTimeoutFault } from "../../generated/api/PartyTimeoutFault";
import { PaymentFaultEnum } from "../../generated/api/PaymentFault";
import { PaymentFaultV2Enum } from "../../generated/api/PaymentFaultV2";
import { GatewayFault } from "../../generated/api/GatewayFault";
import {
  ValidationFault,
  ValidationFaultEnum
} from "../../generated/api/ValidationFault";
import { PaymentStatusFault } from "../../generated/api/PaymentStatusFault";
import {
  IResponseErrorValidationFault,
  IResponseGatewayError,
  IResponseGatewayTimeout,
  IResponsePartyConfigurationError,
  IResponsePaymentStatusFaultError,
  ResponseGatewayTimeout,
  ResponsePartyConfigurationError,
  ResponsePaymentError,
  ResponsePaymentStatusFaultError
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

type FaultResponse =
  | IResponsePaymentStatusFaultError
  | IResponsePartyConfigurationError
  | IResponseErrorValidationFault
  | IResponseGatewayError
  | IResponseGatewayTimeout;

export const responseFromPaymentFault: (
  detail: PaymentFaultEnum,
  detail_v2: PaymentFaultV2Enum
) => FaultResponse = (detail, detail_v2) => {
  // eslint-disable-next-line functional/prefer-readonly-type
  const parsers: Array<t.Decode<PaymentFaultV2Enum, FaultResponse>> = [
    flow(
      PartyConfigurationFault.decode,
      E.map(v => ResponsePartyConfigurationError(detail, v))
    ),
    flow(
      ValidationFault.decode,
      E.map(v => ResponseErrorValidationFault(detail, v))
    ),
    flow(
      PaymentStatusFault.decode,
      E.map(v => ResponsePaymentStatusFaultError(detail, v))
    ),
    flow(
      GatewayFault.decode,
      E.map(v => ResponsePaymentError(detail, v))
    ),
    flow(
      PartyTimeoutFault.decode,
      E.map(v => ResponseGatewayTimeout(v))
    )
  ];

  const reducer: (
    current: E.Either<FaultResponse, PaymentFaultV2Enum>,
    decoder: t.Decode<PaymentFaultV2Enum, FaultResponse>
  ) => E.Either<FaultResponse, PaymentFaultV2Enum> = (current, decoder) =>
    pipe(
      current,
      E.chain((d: PaymentFaultV2Enum) =>
        pipe(
          decoder(d),
          E.swap,
          E.map(_ => d)
        )
      )
    );

  return pipe(
    parsers,
    A.reduce(E.right(detail_v2), reducer),
    E.fold(t.identity, (variant: PaymentFaultV2Enum) => {
      logger.error(`unmapped detail_v2: ${variant}`);
      throw new Error(`unmapped detail_v2: ${variant}`);
    })
  );
};
