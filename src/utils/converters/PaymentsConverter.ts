/**
 * Payments Converter
 * Data Converter for Payments Request\Responses
 */

import { Either, Left } from "fp-ts/lib/Either";
import {
  PaymentsActivationRequestPagoPa,
  PaymentsCheckRequestPagoPa,
  PaymentsCheckResponsePagoPa,
  PaymentsStatusUpdateRequestPagoPa
} from "../../FakePagoPaExternalTypes";
import { PaymentsActivationRequest } from "../../types/controllers/PaymentsActivationRequest";
import { PaymentsCheckRequest } from "../../types/controllers/PaymentsCheckRequest";
import { PaymentsCheckResponse } from "../../types/controllers/PaymentsCheckResponse";
import { PaymentsStatusUpdateRequest } from "../../types/controllers/PaymentsStatusUpdateRequest";

// Convert PaymentsCheckRequest (controller) to PaymentsCheckRequestPagoPa (PagoPa API)
export function getPaymentsCheckRequestPagoPa(
  paymentsCheckRequest: PaymentsCheckRequest
): Either<Error, PaymentsCheckRequestPagoPa> {
  // codificaInfrastrutturaPSP="QR-CODE"
  return new Left(new Error("TODO"));
}

// Convert PaymentsCheckResponsePagoPa (PagoPa API) to PaymentsCheckResponse (controller)
export function getPaymentsCheckResponse(
  paymentsCheckResponsePagoPa: PaymentsCheckResponsePagoPa
): Either<Error, PaymentsCheckResponse> {
  return new Left(new Error("TODO"));
}

// Convert PaymentsActivationRequest (controller) to PaymentsActivationRequestPagoPa (PagoPa API)
export function getPaymentsActivationRequestPagoPa(
  paymentsActivationRequest: PaymentsActivationRequest
): Either<Error, PaymentsActivationRequestPagoPa> {
  // codificaInfrastrutturaPSP="QR-CODE"
  return new Left(new Error("TODO"));
}

// Convert PaymentsStatusUpdateRequestPagoPa (PagoPa API) to PaymentsStatusUpdateRequest (controller)
export function getPaymentsStatusUpdateRequest(
  paymentsStatusUpdateRequestPagoPa: PaymentsStatusUpdateRequestPagoPa
): Either<Error, PaymentsStatusUpdateRequest> {
  return new Left(new Error("TODO"));
}
