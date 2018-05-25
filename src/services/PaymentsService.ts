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

// Send a request to PagoPaAPI to update subscription (Activation or Deactivation)
export async function sendPaymentCheckToPagoPaAPI(
  paymentCheckRequestPagoPa: PaymentsCheckRequestPagoPa,
  pagoPaConfig: PagoPaConfig
): Promise<Either<ControllerError, PaymentsCheckResponsePagoPa>> {
  // TODO
  return new Left(ControllerError.ERROR_API_UNAVAILABLE);
}

// Send a request to PagoPaAPI to update subscription (Activation or Deactivation)
export async function sendPaymentsActivationToPagoPaAPI(
  paymentsActivationRequestPagoPa: PaymentsActivationRequestPagoPa,
  pagoPaConfig: PagoPaConfig
): Promise<Either<ControllerError, void>> {
  // TODO
  return new Left(ControllerError.ERROR_API_UNAVAILABLE);
}

export async function sendPaymentsStatusUpdateToAPIAvvisi(
  paymentsStatusUpdateRequest: PaymentsStatusUpdateRequest,
  cdAvvisiConfig: CDAvvisiConfig
): Promise<Either<ControllerError, void>> {
  // TODO
  return new Left(ControllerError.ERROR_API_UNAVAILABLE);
}
