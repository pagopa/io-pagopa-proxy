/**
 * Payments Services
 * Provide services related to Payments (Nodo) to communicate with PagoPaAPI and Cd Avviso API
 */

import { Either, Left } from "fp-ts/lib/Either";
import { CDAvvisiConfig, PagoPaConfig } from "../Configuration";
import { ControllerError } from "../enums/ControllerError";
import {
  PaymentsActivationRequestPagoPa,
  PaymentsCheckRequestPagoPa,
  PaymentsCheckResponsePagoPa
} from "../FakePagoPaExternalTypes";
import { PaymentsStatusUpdateRequest } from "../types/controllers/PaymentsStatusUpdateRequest";

// Send a request to PagoPaAPI to check payment info
export async function sendPaymentCheckRequestToPagoPaAPI(
  paymentCheckRequestPagoPa: PaymentsCheckRequestPagoPa,
  pagoPaConfig: PagoPaConfig
): Promise<Either<ControllerError, PaymentsCheckResponsePagoPa>> {
  // TODO
  return new Left(ControllerError.ERROR_API_UNAVAILABLE);
}

// Send a request to PagoPaAPI to activate a payment
export async function sendPaymentsActivationRequestToPagoPaAPI(
  paymentsSubscriptionUpdateRequestPagoPa: PaymentsActivationRequestPagoPa,
  pagoPaConfig: PagoPaConfig
): Promise<Either<ControllerError, void>> {
  // TODO
  return new Left(ControllerError.ERROR_API_UNAVAILABLE);
}

// Send a payment status update to CD Avvisi API
export async function sendPaymentsStatusUpdateToAPIAvvisi(
  paymentsStatusUpdateRequest: PaymentsStatusUpdateRequest,
  cdAvvisiConfig: CDAvvisiConfig
): Promise<Either<ControllerError, void>> {
  // TODO
  return new Left(ControllerError.ERROR_API_UNAVAILABLE);
}
