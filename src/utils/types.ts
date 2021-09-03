import {
  IResponseType,
  TypeofApiParams,
  TypeofApiResponse
} from "italia-ts-commons/lib/requests";
import {
  IResponse,
  IResponseErrorInternal,
  IResponseErrorNotFound,
  IResponseErrorValidation,
  IResponseSuccessJson,
  ProblemJson
} from "italia-ts-commons/lib/responses";
import { PaymentProblemJson } from "../../generated/api/PaymentProblemJson";

export type AsControllerResponseType<T> = T extends IResponseType<200, infer R>
  ? IResponseSuccessJson<R>
  : T extends IResponseType<400, ProblemJson>
    ? IResponseErrorValidation
    : T extends IResponseType<404, ProblemJson>
      ? IResponseErrorNotFound
      : T extends IResponseType<500, ProblemJson>
        ? IResponseErrorInternal
        : T extends IResponseType<500, PaymentProblemJson>
          ? IResponsePaymentError
          : never;

export type AsControllerFunction<T> = (
  params: TypeofApiParams<T>
) => Promise<AsControllerResponseType<TypeofApiResponse<T>>>;

/**
 * Interface to model a 500 with json response.
 */
export interface IResponsePaymentError
  extends IResponse<"IResponseErrorInternal"> {
  readonly body: PaymentProblemJson;
}

/**
 * Returns a 500 with json response.
 *
 * @param o The object to return to the client
 */
export const ResponsePaymentError = (
  o: PaymentProblemJson
): IResponsePaymentError => {
  const kindlessObject = Object.assign(Object.assign({}, o), {
    kind: undefined
  });
  return {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    apply: res => res.status(500).json(kindlessObject),
    kind: "IResponseErrorInternal",
    body: o
  };
};
