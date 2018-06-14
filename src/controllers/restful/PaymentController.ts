/**
 * PaymentControllers
 * RESTful Controllers for Payments Endpoints
 */

import * as express from "express";
import { isLeft } from "fp-ts/lib/Either";
import { clients as pagoPaSoapClient } from "italia-pagopa-api";
import { PPTPortTypes } from "italia-pagopa-api/dist/wsdl-lib/PagamentiTelematiciPspNodoservice/PPTPort";
import {
  HttpStatusCodeEnum,
  IResponseErrorGeneric,
  IResponseErrorValidation,
  IResponseSuccessJson,
  ResponseErrorFromValidationErrors,
  ResponseErrorGeneric,
  ResponseErrorValidation,
  ResponseSuccessJson
} from "italia-ts-commons/lib/responses";
import * as uuid from "uuid";
import { PagoPaConfig } from "../../Configuration";
import * as PaymentsService from "../../services/PaymentsService";
import { PaymentsActivationRequest } from "../../types/controllers/PaymentsActivationRequest";
import { PaymentsActivationResponse } from "../../types/controllers/PaymentsActivationResponse";
import { PaymentsCheckRequest } from "../../types/controllers/PaymentsCheckRequest";
import { PaymentsCheckResponse } from "../../types/controllers/PaymentsCheckResponse";
import { CodiceContestoPagamento } from "../../types/PagoPaTypes";
import * as PaymentsConverter from "../../utils/PaymentsConverter";

/**
 * This controller is invoked by BackendApp
 * to retrieve information about a qrcode (payment).
 * It asks PagoPa for payment information using VerificaRPT service.
 * @param {express.Request} req - The RESTful request
 * @param {PagoPaConfig} pagoPaConfig - Configuration about PagoPa WS to contact
 * @return {Promise<PaymentCtrlResponse<PaymentsActivationResponse>>} The response content to send to applicant
 */
export function checkPaymentToPagoPa(
  pagoPaConfig: PagoPaConfig,
  paymentVerificaRPTPagoPaClient: pagoPaSoapClient.PagamentiTelematiciPspNodoAsyncClient
): (
  req: express.Request
) => Promise<
  | IResponseErrorValidation
  | IResponseSuccessJson<PaymentsCheckResponse>
  | IResponseErrorGeneric
> {
  return async req => {
    // Validate qrcode data provided by BackendApp
    const errorOrPaymentsCheckRequest = PaymentsCheckRequest.decode(req.params);
    if (isLeft(errorOrPaymentsCheckRequest)) {
      const error = errorOrPaymentsCheckRequest.value;
      return ResponseErrorFromValidationErrors(PaymentsCheckRequest)(error);
    }
    const paymentsCheckRequest = errorOrPaymentsCheckRequest.value;

    // Generate a Session Token called CodiceContestoPagamento
    // to follow a stream of requests with PagoPa.
    // It will be generated here after the first interaction
    // started by BackendApp (checkPaymentToPagoPa)
    // For the next messages, BackendApp will provide the same codiceContestoPagamento
    const codiceContestoPagamento = generateCodiceContestoPagamento();

    // Convert the input provided by BackendApp (RESTful request) to a PagoPa request (SOAP request).
    // Some static information will be obtained by pagoPaConfig, to identify this client.
    const errorOrPaymentCheckRequestPagoPa = PaymentsConverter.getPaymentsCheckRequestPagoPa(
      pagoPaConfig,
      paymentsCheckRequest,
      codiceContestoPagamento
    );
    if (isLeft(errorOrPaymentCheckRequestPagoPa)) {
      const error = errorOrPaymentCheckRequestPagoPa.value;
      return ResponseErrorValidation("Invalid PagoPa Request", error.message);
    }
    const paymentCheckRequestPagoPa = errorOrPaymentCheckRequestPagoPa.value;

    // Send the SOAP request to PagoPa (VerificaRPT message)
    const errorOrPaymentCheckPagoPaResponse = await PaymentsService.sendPaymentCheckRequestToPagoPa(
      paymentCheckRequestPagoPa,
      paymentVerificaRPTPagoPaClient
    );
    if (isLeft(errorOrPaymentCheckPagoPaResponse)) {
      const error = errorOrPaymentCheckPagoPaResponse.value;
      return ResponseErrorGeneric(
        HttpStatusCodeEnum.HTTP_STATUS_500,
        "PagoPa Server communication error",
        error.message
      );
    }
    const paymentCheckPagoPaResponse = errorOrPaymentCheckPagoPaResponse.value;

    // Check PagoPa response content.
    // If it contains an error, an HTTP error will be provided to BackendApp
    if (
      paymentCheckPagoPaResponse.nodoVerificaRPTRisposta.esito ===
      PPTPortTypes.Esito.KO
    ) {
      return ResponseErrorGeneric(
        HttpStatusCodeEnum.HTTP_STATUS_500,
        "Request rejected",
        "Error during payment check: esito === KO"
      );
    }

    // Convert the output provided by PagoPa (SOAP response)
    // to a BackendApp response (RESTful response), mapping the result information.
    // Send a response to BackendApp
    return PaymentsConverter.getPaymentsCheckResponse(
      paymentCheckPagoPaResponse,
      codiceContestoPagamento
    ).fold<
      IResponseErrorValidation | IResponseSuccessJson<PaymentsCheckResponse>
    >(
      error => ResponseErrorFromValidationErrors(PaymentsCheckResponse)(error),
      ResponseSuccessJson
    );
  };
}

/**
 * This controller will be invoked by BackendApp.
 * It's necessary to start the payment process for a specific qrcode (payment).
 * It will require the payment lock to PagoPa (AttivaRPT service) to avoid concurrency problems.
 * This request result will confirm the taking charge about the payment lock request.
 * If success, it will be necessary to wait an async response from PagoPa.
 * @param {express.Request} req - The RESTful request
 * @param {PagoPaConfig} pagoPaConfig - Configuration about PagoPa WS to contact
 * @return {Promise<PaymentCtrlResponse<PaymentsActivationResponse>>} The response content to send to applicant
 */
export function activatePaymentToPagoPa(
  pagoPaConfig: PagoPaConfig,
  attivaRPTPagoPaClient: pagoPaSoapClient.PagamentiTelematiciPspNodoAsyncClient
): (
  req: express.Request
) => Promise<
  | IResponseErrorValidation
  | IResponseErrorGeneric
  | IResponseSuccessJson<PaymentsActivationResponse>
> {
  return async req => {
    // Validate input provided by BackendAp
    const errorOrPaymentsActivationRequest = PaymentsActivationRequest.decode(
      req.params
    );
    if (isLeft(errorOrPaymentsActivationRequest)) {
      const error = errorOrPaymentsActivationRequest.value;
      return ResponseErrorFromValidationErrors(PaymentsActivationRequest)(
        error
      );
    }
    const paymentsActivationRequest = errorOrPaymentsActivationRequest.value;

    // Convert the input provided by BackendApp (RESTful request)
    // to a PagoPa request (SOAP request), mapping useful information
    // Some static information will be obtained by pagoPaConfig, to identify this client
    // If something wrong into input will be detected during mapping, and error will be provided as response
    const errorOrPaymentsActivationRequestPagoPa = PaymentsConverter.getPaymentsActivationRequestPagoPa(
      pagoPaConfig,
      paymentsActivationRequest
    );
    if (isLeft(errorOrPaymentsActivationRequestPagoPa)) {
      const error = errorOrPaymentsActivationRequestPagoPa.value;
      return ResponseErrorValidation("Invalid PagoPa Request", error.message);
    }
    const paymentsActivationRequestPagoPa =
      errorOrPaymentsActivationRequestPagoPa.value;

    // Send the SOAP request to PagoPa (AttivaRPT message)
    const errorOrPaymentActivationPagoPaResponse = await PaymentsService.sendPaymentsActivationRequestToPagoPaAPI(
      paymentsActivationRequestPagoPa,
      attivaRPTPagoPaClient
    );
    if (isLeft(errorOrPaymentActivationPagoPaResponse)) {
      const error = errorOrPaymentActivationPagoPaResponse.value;
      return ResponseErrorGeneric(
        HttpStatusCodeEnum.HTTP_STATUS_500,
        "PagoPa Server communication error",
        error.message
      );
    }
    const paymentActivationPagoPaResponse =
      errorOrPaymentActivationPagoPaResponse.value;

    // Check PagoPa response content.
    // If it contains an error, an HTTP error will be provided to BackendApp
    if (
      paymentActivationPagoPaResponse.nodoAttivaRPTRisposta.esito ===
      PPTPortTypes.Esito.KO
    ) {
      return ResponseErrorGeneric(
        HttpStatusCodeEnum.HTTP_STATUS_500,
        "Request rejected",
        "Error during payment check: esito === KO"
      );
    }

    // Convert the output provided by PagoPa (SOAP response)
    // to a BackendApp response (RESTful response), mapping the result information.
    // Send a response to BackendApp
    return PaymentsConverter.getPaymentsActivationResponse(
      paymentActivationPagoPaResponse
    ).fold<
      | IResponseErrorValidation
      | IResponseSuccessJson<PaymentsActivationResponse>
    >(
      error =>
        ResponseErrorFromValidationErrors(PaymentsActivationResponse)(error),
      ResponseSuccessJson
    );
  };
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
