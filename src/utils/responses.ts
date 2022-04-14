import { errorsToReadableMessages } from "@pagopa/ts-commons/lib/reporters";
import * as t from "io-ts";
import {
  HttpStatusCodeEnum,
  IResponseErrorValidation,
  ResponseErrorGeneric
} from "@pagopa/ts-commons/lib/responses";
import { PartyConfigurationFault } from "../../generated/api/PartyConfigurationFault";
import { PartyTimeoutFault } from "../../generated/api/PartyTimeoutFault";

export const ResponseErrorValidation: (
  title: string,
  detail: string | PartyConfigurationFault | PartyTimeoutFault
) => IResponseErrorValidation = (title, detail) => {
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
    kind: "IResponseErrorValidation"
  };
};

export const ResponseErrorFromValidationErrors: <S, A>(
  type: t.Type<A, S, unknown>
) => (
  errors: ReadonlyArray<t.ValidationError>
) => // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
IResponseErrorValidation = type => errors => {
  const detail = errorsToReadableMessages(errors).join("\n");
  return ResponseErrorValidation(`Invalid ${type.name}`, detail);
};
