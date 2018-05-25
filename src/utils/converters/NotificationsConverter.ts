/**
 * Notifications Converter
 * Data Converter for Notifications Request\Responses
 */

import { Either, Left } from "fp-ts/lib/Either";
import { NotificationsDispatchRequestPagoPa } from "../../FakePagoPaExternalTypes";
import { NotificationsDispatchRequest } from "../../types/controllers/NotificationsDispatchRequest";

// Convert NotificationsDispatchRequestPagoPa (PagoPa API) to NotificationsDispatchRequest (CD Avvisi API)
export function getNotificationsDispatchRequest(
  notificationsDispatchRequestPagoPa: NotificationsDispatchRequestPagoPa
): Either<Error, NotificationsDispatchRequest> {
  return new Left(new Error("TODO"));
}
