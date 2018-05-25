/**
 * Receipts Converter
 * Data Converter for Receipts Request\Responses
 */

import { Either, Left } from "fp-ts/lib/Either";
import { ReceiptsDispatchRequestPagoPa } from "../../FakePagoPaExternalTypes";
import { ReceiptsDispatchRequest } from "../../types/controllers/ReceiptsDispatchRequest";

// Convert ReceiptsDispatchRequestPagoPa (PagoPa API) to ReceiptsDispatchRequest (CD Avvisi API)
export function getReceiptsDispatchRequest(
  receiptsDispatchRequestPagoPa: ReceiptsDispatchRequestPagoPa
): Either<Error, ReceiptsDispatchRequest> {
  return new Left(new Error("TODO"));
}
