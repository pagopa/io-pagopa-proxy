/**
  * PaymentControllers
  * RESTful Controllers for Payments Endpoints
  */

import * as express from "express";
import { Either, left, right } from "fp-ts/lib/Either";
import { PPTPortTypes } from "italia-pagopa-api/dist/wsdl-lib/PagamentiTelematiciPspNodoservice/PPTPort";
import * as uuid from "uuid";
import { PagoPaConfig } from "../../Configuration";
import { ControllerError } from "../../enums/ControllerError";
import { HttpErrorStatusCode } from "../../enums/HttpErrorStatusCode";
import * as PaymentsService from "../../services/PaymentsService";
import { PaymentsActivationRequest } from "../../types/controllers/PaymentsActivationRequest";
import { PaymentsActivationResponse } from "../../types/controllers/PaymentsActivationResponse";
import { PaymentsCheckRequest } from "../../types/controllers/PaymentsCheckRequest";
import { PaymentsCheckResponse } from "../../types/controllers/PaymentsCheckResponse";
import { CodiceContestoPagamento } from "../../types/PagoPaTypes";
import * as PaymentsConverter from "../../utils/PaymentsConverter";
import * as RestfulUtils from "../../utils/RestfulUtils";
// Forward a payment check request from BackendApp to PagoPa
export async function checkPaymentToPagoPa(
  req: express.Request,
  res: express.Response,
  pagoPaConfig: PagoPaConfig
): Promise<Either<ControllerError, PaymentsCheckResponse>> {
  // Validate input
  const errorOrPaymentsCheckRequest = PaymentsCheckRequest.decode(req.params);
  if (errorOrPaymentsCheckRequest.isLeft()) {
    return left(RestfulUtils.sendErrorResponse(
      res,
      ControllerError.ERROR_INVALID_INPUT,
      HttpErrorStatusCode.BAD_REQUEST
    ));
  }

  // Generate a session token (this is the first message of a payment flow)
  const errorOrCodiceContestoPagamento = generateCodiceContestoPagamento();
  if (errorOrCodiceContestoPagamento.isLeft()) {
    return left(RestfulUtils.sendErrorResponse(
      res,
      ControllerError.ERROR_INTERNAL,
      HttpErrorStatusCode.INTERNAL_ERROR
    ));
  }

  // Convert controller request to PagoPa request
  const errorOrPaymentCheckRequestPagoPa = PaymentsConverter.getPaymentsCheckRequestPagoPa(
    pagoPaConfig,
    errorOrPaymentsCheckRequest.value,
    errorOrCodiceContestoPagamento.value
  );
  if (errorOrPaymentCheckRequestPagoPa.isLeft()) {
    return left(RestfulUtils.sendErrorResponse(
      res,
      ControllerError.ERROR_INVALID_INPUT,
      HttpErrorStatusCode.BAD_REQUEST
    ));
  }

  // Require payment check to PagoPa
  const errorOrPaymentCheckPagoPaResponse = await PaymentsService.sendPaymentCheckRequestToPagoPa(
    errorOrPaymentCheckRequestPagoPa.value,
    pagoPaConfig
  );

  // Provide a response to applicant if error occurred
  if (errorOrPaymentCheckPagoPaResponse.isLeft()) {
    RestfulUtils.sendUnavailableAPIError(res);
    return left(ControllerError.ERROR_API_UNAVAILABLE);
  }

  // Check if request was rejected
  if (
    errorOrPaymentCheckPagoPaResponse.value.nodoVerificaRPTRisposta.esito ===
    PPTPortTypes.Esito.KO
  ) {
    return left(RestfulUtils.sendErrorResponse(
      res,
      ControllerError.REQUEST_REJECTED,
      HttpErrorStatusCode.BAD_REQUEST
    ));
  }

  // Convert PagoPa response to controller response
  const errorOrPaymentCheckResponse = PaymentsConverter.getPaymentsCheckResponse(
    errorOrPaymentCheckPagoPaResponse.value,
    errorOrCodiceContestoPagamento.value
  );
  if (errorOrPaymentCheckResponse.isLeft()) {
    return left(RestfulUtils.sendErrorResponse(
      res,
      ControllerError.ERROR_INVALID_API_RESPONSE,
      HttpErrorStatusCode.INTERNAL_ERROR
    ));
  }
  RestfulUtils.sendSuccessResponse(res, errorOrPaymentCheckResponse.value);
  return right(errorOrPaymentCheckResponse.value);
}

// Forward a payment check request from BackendApp to PagoPa
export async function activatePaymentToPagoPa(
  req: express.Request,
  res: express.Response,
  pagoPaConfig: PagoPaConfig
): Promise<Either<ControllerError, PaymentsActivationResponse>> {
  // Validate input
  const errorOrPaymentsActivationRequest = PaymentsActivationRequest.decode(
    req.params
  );
  if (errorOrPaymentsActivationRequest.isLeft()) {
    return left(RestfulUtils.sendErrorResponse(
      res,
      ControllerError.ERROR_INVALID_INPUT,
      HttpErrorStatusCode.BAD_REQUEST
    ));
  }

  // Convert controller request to PagoPa request
  const errorOrPaymentsActivationRequestPagoPa = PaymentsConverter.getPaymentsActivationRequestPagoPa(
    pagoPaConfig,
    errorOrPaymentsActivationRequest.value
  );
  if (errorOrPaymentsActivationRequestPagoPa.isLeft()) {
    return left(RestfulUtils.sendErrorResponse(
      res,
      ControllerError.ERROR_INVALID_INPUT,
      HttpErrorStatusCode.BAD_REQUEST
    ));
  }

  // Require payment activation to PagoPa API
  const errorOrPaymentActivationPagoPaResponse = await PaymentsService.sendPaymentsActivationRequestToPagoPaAPI(
    errorOrPaymentsActivationRequestPagoPa.value,
    pagoPaConfig
  );

  // Provide a response to applicant
  if (errorOrPaymentActivationPagoPaResponse.isLeft()) {
    RestfulUtils.sendUnavailableAPIError(res);
    return left(ControllerError.ERROR_API_UNAVAILABLE);
  }

  // Check if request was rejected
  if (
    errorOrPaymentActivationPagoPaResponse.value.nodoAttivaRPTRisposta.esito ===
    PPTPortTypes.Esito.KO
  ) {
    return left(RestfulUtils.sendErrorResponse(
      res,
      ControllerError.REQUEST_REJECTED,
      HttpErrorStatusCode.BAD_REQUEST
    ));
  }

  // Convert PagoPa response to controller response
  const errorOrPaymentActivationResponse = PaymentsConverter.getPaymentsActivationResponse(
    errorOrPaymentActivationPagoPaResponse.value
  );
  if (errorOrPaymentActivationResponse.isLeft()) {
    return left(RestfulUtils.sendErrorResponse(
      res,
      ControllerError.ERROR_INVALID_API_RESPONSE,
      HttpErrorStatusCode.INTERNAL_ERROR
    ));
  }
  RestfulUtils.sendSuccessResponse(res, errorOrPaymentActivationResponse.value);
  return right(errorOrPaymentActivationResponse.value);
}

/** Receive an async activation result frop PagoPA
  * TODO: [#157910857] Creazione dei controller SOAP per l'esposizione dei servizi verso PagoPa
  * TODO: [#158176380] Gestione della conferma di attivazione di un pagamento
  */
// tslint:disable-next-line:no-empty
export async function notifyPaymentStatusToAPINotifica(): Promise<void> {}

// Generate a Session Token to follow a stream of requests
function generateCodiceContestoPagamento(): Either<
  Error,
  CodiceContestoPagamento
> {
  return CodiceContestoPagamento.decode(uuid.v1()).mapLeft(() => {
    return Error();
  });
}
