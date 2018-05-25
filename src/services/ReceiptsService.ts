/**
 * Receipts Services
 * Provide services related to Receipts (Nodo) to communicate with PagoPaAPI and Cd Avviso API
 */

import { Either, Left } from "fp-ts/lib/Either";
import { CDAvvisiConfig } from "../Configuration";
import { ControllerError } from "../enums/ControllerError";
import { ReceiptsDispatchRequest } from "../types/controllers/ReceiptsDispatchRequest";

// Send a receipt to CD Avvisi API
export async function sendReceiptsDispatchRequestToAPIAvvisi(
  receiptsDispatchRequest: ReceiptsDispatchRequest,
  cdAvvisiConfig: CDAvvisiConfig
): Promise<Either<ControllerError, void>> {
  // TODO
  return new Left(ControllerError.ERROR_API_UNAVAILABLE);
}
