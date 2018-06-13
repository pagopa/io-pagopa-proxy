/**
 * PaymentControllers
 * RESTful Controllers for Payments Endpoints
 */

import * as express from "express";
import { Either, left, right } from "fp-ts/lib/Either";
import { clients as pagoPaSoapClient } from "italia-pagopa-api";
import { PPTPortTypes } from "italia-pagopa-api/dist/wsdl-lib/PagamentiTelematiciPspNodoservice/PPTPort";
import { ResponseSuccessJson } from "italia-ts-commons/lib/responses";
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

/**
 * This controller will be invoked by BackendApp.
 * It's necessary to retrieve information about a qrcode (payment)
 * It will require payment information to PagoPa using VerificaRPT service
 * @param {express.Request} req - The RESTful request
 * @param {express.Response} res - The RESTful response to fill with payment information
 * @param {PagoPaConfig} pagoPaConfig - Configuration about PagoPa WS to contact
 * @return {Promise<Either<ControllerError, PaymentsCheckResponse>>} The response content provided into res
 */
export async function checkPaymentToPagoPa(
  req: express.Request,
  res: express.Response,
  pagoPaConfig: PagoPaConfig,
  paymentVerificaRPTPagoPaClient: pagoPaSoapClient.PagamentiTelematiciPspNodoAsyncClient
): Promise<Either<ControllerError, PaymentsCheckResponse>> {
  // Validate input provided by BackendApp
  const errorOrPaymentsCheckRequest = PaymentsCheckRequest.decode(req.params);
  if (errorOrPaymentsCheckRequest.isLeft()) {
    return left(
      RestfulUtils.sendErrorResponse(
        res,
        ControllerError.ERROR_INVALID_INPUT,
        HttpErrorStatusCode.keys.BAD_REQUEST
      )
    );
  }

  /**
   * Generate a Session Token called CodiceContestoPagamento
   * to follow a stream of requests with PagoPa.
   * It will be generated here after the first interaction
   * started by BackendApp (checkPaymentToPagoPa)
   * For the next messages, BackendApp will provide the same codiceContestoPagamento
   */
  const codiceContestoPagamento = generateCodiceContestoPagamento();

  /**
   * Convert the input provided by BackendApp (RESTful request)
   * to a PagoPa request (SOAP request), mapping useful information
   * Some static information will be obtained by pagoPaConfig, to identify this client
   * If something wrong into input will be detected during mapping, and error will be provided as response
   */
  const errorOrPaymentCheckRequestPagoPa = PaymentsConverter.getPaymentsCheckRequestPagoPa(
    pagoPaConfig,
    errorOrPaymentsCheckRequest.value,
    codiceContestoPagamento
  );
  if (errorOrPaymentCheckRequestPagoPa.isLeft()) {
    return left(
      RestfulUtils.sendErrorResponse(
        res,
        ControllerError.ERROR_INVALID_INPUT,
        HttpErrorStatusCode.keys.BAD_REQUEST
      )
    );
  }

  // Send the SOAP request to PagoPa (VerificaRPT message)
  const errorOrPaymentCheckPagoPaResponse = await PaymentsService.sendPaymentCheckRequestToPagoPa(
    errorOrPaymentCheckRequestPagoPa.value,
    paymentVerificaRPTPagoPaClient
  );
  if (errorOrPaymentCheckPagoPaResponse.isLeft()) {
    RestfulUtils.sendUnavailableAPIError(res);
    return left(ControllerError.ERROR_API_UNAVAILABLE);
  }

  /**
   * Check PagoPa response content.
   * If it contains an error, an HTTP error will be provided to BackendApp
   */
  if (
    errorOrPaymentCheckPagoPaResponse.value.nodoVerificaRPTRisposta.esito ===
    PPTPortTypes.Esito.KO
  ) {
    return left(
      RestfulUtils.sendErrorResponse(
        res,
        ControllerError.REQUEST_REJECTED,
        HttpErrorStatusCode.keys.BAD_REQUEST
      )
    );
  }

  /**
   * Convert the output provided by PagoPa (SOAP response)
   * to a BackendApp response (RESTful response), mapping the result information.
   * Send a response to BackendApp
   */
  const errorOrPaymentCheckResponse = PaymentsConverter.getPaymentsCheckResponse(
    errorOrPaymentCheckPagoPaResponse.value,
    codiceContestoPagamento
  );
  if (errorOrPaymentCheckResponse.isLeft()) {
    return left(
      RestfulUtils.sendErrorResponse(
        res,
        ControllerError.ERROR_INVALID_API_RESPONSE,
        HttpErrorStatusCode.keys.INTERNAL_ERROR
      )
    );
  }
  ResponseSuccessJson(errorOrPaymentCheckResponse.value).apply(res);
  return right(errorOrPaymentCheckResponse.value);
}

/**
 * This controller will be invoked by BackendApp.
 * It's necessary to start the payment process for a specific qrcode (payment)
 * It will require the payment lock to PagoPa (AttivaRPT service) to avoid concurrency problems
 * This request result will confirm the taking charge about the payment lock request
 * If success, it will be necessary to wait an async response from PagoPa
 * @param {express.Request} req - The RESTful request
 * @param {express.Response} res - The RESTful response to fill with request result
 * @param {PagoPaConfig} pagoPaConfig - Configuration about PagoPa WS to contact
 * @return {Promise<Either<ControllerError, PaymentsCheckResponse>>} The response content provided into res
 */
export async function activatePaymentToPagoPa(
  req: express.Request,
  res: express.Response,
  pagoPaConfig: PagoPaConfig,
  attivaRPTPagoPaClient: pagoPaSoapClient.PagamentiTelematiciPspNodoAsyncClient
): Promise<Either<ControllerError, PaymentsActivationResponse>> {
  // Validate input
  const errorOrPaymentsActivationRequest = PaymentsActivationRequest.decode(
    req.params
  );
  if (errorOrPaymentsActivationRequest.isLeft()) {
    return left(
      RestfulUtils.sendErrorResponse(
        res,
        ControllerError.ERROR_INVALID_INPUT,
        HttpErrorStatusCode.keys.BAD_REQUEST
      )
    );
  }

  // Convert controller request to PagoPa request
  const errorOrPaymentsActivationRequestPagoPa = PaymentsConverter.getPaymentsActivationRequestPagoPa(
    pagoPaConfig,
    errorOrPaymentsActivationRequest.value
  );
  if (errorOrPaymentsActivationRequestPagoPa.isLeft()) {
    return left(
      RestfulUtils.sendErrorResponse(
        res,
        ControllerError.ERROR_INVALID_INPUT,
        HttpErrorStatusCode.keys.BAD_REQUEST
      )
    );
  }

  // Require payment activation to PagoPa API
  const errorOrPaymentActivationPagoPaResponse = await PaymentsService.sendPaymentsActivationRequestToPagoPaAPI(
    errorOrPaymentsActivationRequestPagoPa.value,
    attivaRPTPagoPaClient
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
    return left(
      RestfulUtils.sendErrorResponse(
        res,
        ControllerError.REQUEST_REJECTED,
        HttpErrorStatusCode.keys.BAD_REQUEST
      )
    );
  }

  // Convert PagoPa response to controller response
  const errorOrPaymentActivationResponse = PaymentsConverter.getPaymentsActivationResponse(
    errorOrPaymentActivationPagoPaResponse.value
  );
  if (errorOrPaymentActivationResponse.isLeft()) {
    return left(
      RestfulUtils.sendErrorResponse(
        res,
        ControllerError.ERROR_INVALID_API_RESPONSE,
        HttpErrorStatusCode.keys.INTERNAL_ERROR
      )
    );
  }
  ResponseSuccessJson(errorOrPaymentActivationResponse.value).apply(res);
  return right(errorOrPaymentActivationResponse.value);
}

/** Receive an async activation result frop PagoPA
 * TODO: [#157910857] Creazione dei controller SOAP per l'esposizione dei servizi verso PagoPa
 * TODO: [#158176380] Gestione della conferma di attivazione di un pagamento
 */
// tslint:disable-next-line:no-empty
export async function notifyPaymentStatusToAPINotifica(): Promise<void> {}

/**
 * Generate a Session Token based on uuid (timestamp + random)
 * to follow a stream of requests with PagoPa.
 * It will be generated here after the first interaction
 * started by BackendApp (checkPaymentToPagoPa)
 * For the next messages, BackendApp will provide the same codiceContestoPagamento
 * @return {Either<Error,CodiceContestoPagamento>} The generated token or an internal error
 */
function generateCodiceContestoPagamento(): CodiceContestoPagamento {
  return uuid.v1() as CodiceContestoPagamento;
}
