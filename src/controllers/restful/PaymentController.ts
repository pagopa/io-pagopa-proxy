/**
 * PaymentControllers
 * RESTful Controllers for Payments Endpoints
 */

import * as express from "express";
import { isLeft } from "fp-ts/lib/Either";
import { clients as pagoPASoapClient } from "italia-pagopa-api";
import {
  Esito,
  IcdInfoPagamentoInput,
  IcdInfoPagamentoOutput
} from "italia-pagopa-api/dist/wsdl-lib/FespCdService/FespCdPortType";
import { PPTPortTypes } from "italia-pagopa-api/dist/wsdl-lib/PagamentiTelematiciPspNodoservice/PPTPort";
import {
  IResponseErrorGeneric,
  IResponseErrorInternal,
  IResponseErrorValidation,
  IResponseSuccessJson,
  ResponseErrorFromValidationErrors,
  ResponseErrorInternal,
  ResponseErrorValidation,
  ResponseSuccessJson
} from "italia-ts-commons/lib/responses";
import * as redis from "redis";
import { promisify } from "util";
import * as uuid from "uuid";
import { PagoPAConfig } from "../../Configuration";
import * as PaymentsService from "../../services/PaymentsService";
import { CodiceContestoPagamento } from "../../types/api/CodiceContestoPagamento";
import { PaymentsActivationRequest } from "../../types/api/PaymentsActivationRequest";
import { PaymentsActivationResponse } from "../../types/api/PaymentsActivationResponse";
import { PaymentsActivationStatusCheckResponse } from "../../types/api/PaymentsActivationStatusCheckResponse";
import { PaymentsCheckRequest } from "../../types/api/PaymentsCheckRequest";
import { PaymentsCheckResponse } from "../../types/api/PaymentsCheckResponse";
import * as PaymentsConverter from "../../utils/PaymentsConverter";

/**
 * This controller is invoked by BackendApp
 * to retrieve information about a payment.
 * It asks PagoPA for payment information using VerificaRPT service.
 * @param {express.Request} req - The RESTful request
 * @param {PagoPAConfig} pagoPAConfig - Configuration about PagoPA WS to contact
 * @return {Promise<PaymentCtrlResponse<PaymentsActivationResponse>>} The response content to send to applicant
 */
export function checkPayment(
  pagoPAConfig: PagoPAConfig,
  paymentVerificaRPTPagoPAClient: pagoPASoapClient.PagamentiTelematiciPspNodoAsyncClient
): (
  req: express.Request
) => Promise<
  // tslint:disable-next-line
  | IResponseErrorValidation
  | IResponseErrorGeneric
  | IResponseErrorInternal
  | IResponseSuccessJson<PaymentsCheckResponse>
> {
  return async req => {
    // Validate payment data provided by BackendApp
    const errorOrPaymentsCheckRequest = PaymentsCheckRequest.decode(req.params);
    if (isLeft(errorOrPaymentsCheckRequest)) {
      const error = errorOrPaymentsCheckRequest.value;
      return ResponseErrorFromValidationErrors(PaymentsCheckRequest)(error);
    }
    const paymentsCheckRequest = errorOrPaymentsCheckRequest.value;

    // Generate a Transaction ID called CodiceContestoPagamento
    // to follow a stream of requests with PagoPA.
    // It will be generated here after the first interaction
    // started by BackendApp (checkPayment)
    // For the next messages, BackendApp will provide the same codiceContestoPagamento
    const codiceContestoPagamento = generateCodiceContestoPagamento();

    // Convert the input provided by BackendApp (RESTful request) to a PagoPA request (SOAP request).
    // Some static information will be obtained by PagoPAConfig, to identify this client.
    const errorOrPaymentCheckRequestPagoPA = PaymentsConverter.getPaymentsCheckRequestPagoPA(
      pagoPAConfig,
      paymentsCheckRequest,
      codiceContestoPagamento
    );
    if (isLeft(errorOrPaymentCheckRequestPagoPA)) {
      const error = errorOrPaymentCheckRequestPagoPA.value;
      return ResponseErrorValidation(
        "Invalid PagoPA check Request",
        error.message
      );
    }
    const paymentCheckRequestPagoPA = errorOrPaymentCheckRequestPagoPA.value;

    // Send the SOAP request to PagoPA (VerificaRPT message)
    const errorOrPaymentCheckPagoPAResponse = await PaymentsService.sendPaymentCheckRequest(
      paymentCheckRequestPagoPA,
      paymentVerificaRPTPagoPAClient
    );
    if (isLeft(errorOrPaymentCheckPagoPAResponse)) {
      const error = errorOrPaymentCheckPagoPAResponse.value;
      return ResponseErrorInternal(
        `PagoPA Server communication error: ${error.message}`
      );
    }
    const paymentCheckPagoPAResponse = errorOrPaymentCheckPagoPAResponse.value;

    // Check PagoPA response content.
    // If it contains an error, an HTTP error will be provided to BackendApp
    if (
      paymentCheckPagoPAResponse.nodoVerificaRPTRisposta.esito ===
      PPTPortTypes.Esito.KO
    ) {
      return ResponseErrorInternal("Error during payment check: esito === KO");
    }

    // Convert the output provided by PagoPA (SOAP response)
    // to a BackendApp response (RESTful response), mapping the result information.
    // Send a response to BackendApp
    return PaymentsConverter.getPaymentsCheckResponse(
      paymentCheckPagoPAResponse,
      codiceContestoPagamento
    ).fold<
      IResponseErrorValidation | IResponseSuccessJson<PaymentsCheckResponse>
    >(
      ResponseErrorFromValidationErrors(PaymentsCheckResponse),
      ResponseSuccessJson
    );
  };
}

/**
 * This controller will be invoked by BackendApp.
 * It's necessary to start the payment process for a specific payment.
 * It will require the payment lock to PagoPA (AttivaRPT service) to avoid concurrency problems.
 * This request result will confirm the taking charge about the payment lock request.
 * If success, it will be necessary to wait an async response from PagoPA.
 * @param {express.Request} req - The RESTful request
 * @param {PagoPAConfig} pagoPAConfig - Configuration about PagoPA WS to contact
 * @return {Promise<PaymentCtrlResponse<PaymentsActivationResponse>>} The response content to send to applicant
 */
export function activatePayment(
  pagoPAConfig: PagoPAConfig,
  attivaRPTPagoPAClient: pagoPASoapClient.PagamentiTelematiciPspNodoAsyncClient
): (
  req: express.Request
) => Promise<
  | IResponseErrorValidation
  | IResponseErrorGeneric
  | IResponseErrorInternal
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
    // to a PagoPA request (SOAP request), mapping useful information
    // Some static information will be obtained by PagoPAConfig, to identify this client
    // If something wrong into input will be detected during mapping, and error will be provided as response
    const errorOrPaymentsActivationRequestPagoPA = PaymentsConverter.getPaymentsActivationRequestPagoPA(
      pagoPAConfig,
      paymentsActivationRequest
    );
    if (isLeft(errorOrPaymentsActivationRequestPagoPA)) {
      const error = errorOrPaymentsActivationRequestPagoPA.value;
      return ResponseErrorValidation(
        "Invalid PagoPA activation Request",
        error.message
      );
    }
    const paymentsActivationRequestPagoPA =
      errorOrPaymentsActivationRequestPagoPA.value;

    // Send the SOAP request to PagoPA (AttivaRPT message)
    const errorOrPaymentActivationPagoPAResponse = await PaymentsService.sendPaymentsActivationRequest(
      paymentsActivationRequestPagoPA,
      attivaRPTPagoPAClient
    );
    if (isLeft(errorOrPaymentActivationPagoPAResponse)) {
      const error = errorOrPaymentActivationPagoPAResponse.value;
      return ResponseErrorInternal(
        `PagoPA Server communication error: ${error.message}`
      );
    }
    const paymentActivationPagoPAResponse =
      errorOrPaymentActivationPagoPAResponse.value;

    // Check PagoPA response content.
    // If it contains an error, an HTTP error will be provided to BackendApp
    if (
      paymentActivationPagoPAResponse.nodoAttivaRPTRisposta.esito ===
      PPTPortTypes.Esito.KO
    ) {
      return ResponseErrorInternal("Error during payment check: esito === KO");
    }

    // Convert the output provided by PagoPA (SOAP response)
    // to a BackendApp response (RESTful response), mapping the result information.
    // Send a response to BackendApp
    return PaymentsConverter.getPaymentsActivationResponse(
      paymentActivationPagoPAResponse
    ).fold<
      | IResponseErrorValidation
      | IResponseSuccessJson<PaymentsActivationResponse>
    >(
      ResponseErrorFromValidationErrors(PaymentsActivationResponse),
      ResponseSuccessJson
    );
  };
}

/**
 * This controller is invoked by PagoPA that provides a paymentId
 * related to a previous async request (attivaRPT)
 * It just store this information into redis db. This information will be retrieved by App using polling
 * @param {IcdInfoPagamentoInput} cdInfoPagamentoInput - The request from PagoPA
 * @param {RedisTimeout} redisTimeout - The expiration timeout for the information to store
 * @param {RedisClient} redisClient - The redis client used to store the paymentId
 * @param {(cdInfoPagamentoOutput: IcdInfoPagamentoOutput) => void} callback - Callback function to send a feedback to PagoPA
 * @return {Promise<IResponse*>} The response content to send to applicant
 */
export function updatePaymentActivationStatusIntoDB(
  cdInfoPagamentoInput: IcdInfoPagamentoInput,
  redisTimeout: number,
  redisClient: redis.RedisClient,
  callback: (cdInfoPagamentoOutput: IcdInfoPagamentoOutput) => void
): void {
  // Check DB connection status
  if (redisClient.connected !== true) {
    callback({
      esito: Esito.KO
    });
  }
  const setAsyncRedis = promisify(redisClient.set).bind(redisClient);
  setAsyncRedis(
    cdInfoPagamentoInput.codiceContestoPagamento,
    cdInfoPagamentoInput.idPagamento,
    "EX", // Set the specified expire time, in seconds.
    redisTimeout
  ).catch((error: Error) => {
    return error;
  });

  callback({
    esito: Esito.OK
  });
}

/**
 * This controller is invoked by BackendApp to check the status of a previous activation request (async process)
 * If PagoPA sent an activation result (via cdInfoPagamento), a paymentId will be retrieved into redis
 * The paymentId is necessary for App to proceed with the payment process
 * @param {redis.RedisClient} redisClient - The redis client used to retrieve the paymentId
 * @return {Promise<IResponse*>} The response content to send to applicant
 */
export function checkPaymentActivationStatusFromDB(
  redisClient: redis.RedisClient
): (
  req: express.Request
) => Promise<
  // tslint:disable-next-line
  | IResponseErrorValidation
  | IResponseErrorGeneric
  | IResponseErrorInternal
  | IResponseSuccessJson<PaymentsActivationStatusCheckResponse>
> {
  return async req => {
    // Validate codiceContestoPagamento (transaction id) data provided by BackendApp
    const errorOrCodiceContestoPagamento = CodiceContestoPagamento.decode(
      req.params.codiceContestoPagamento
    );
    if (isLeft(errorOrCodiceContestoPagamento)) {
      const error = errorOrCodiceContestoPagamento.value;
      return ResponseErrorFromValidationErrors(CodiceContestoPagamento)(error);
    }
    const codiceContestoPagamento = errorOrCodiceContestoPagamento.value;

    // Check db connection status
    if (redisClient.connected !== true) {
      return ResponseErrorInternal("DB currently not available");
    }

    // Retrieve idPayment related to a codiceContestoPagamento from DB
    // It's just a key-value mapping
    const getAsyncRedis = promisify(redisClient.get).bind(redisClient);
    const idPagamento = await getAsyncRedis(codiceContestoPagamento).catch(
      (error: Error) => {
        return error;
      }
    );

    // Define a response to send to the applicant containing an error or the retrieved data
    return PaymentsActivationStatusCheckResponse.decode({
      idPagamento
    }).fold<
      | IResponseErrorValidation
      | IResponseSuccessJson<PaymentsActivationStatusCheckResponse>
    >(
      ResponseErrorFromValidationErrors(PaymentsActivationStatusCheckResponse),
      ResponseSuccessJson
    );
  };
}

/**
 * Generate a Transaction ID based on uuid (timestamp + random)
 * to follow a stream of requests with PagoPA.
 * It will be generated here after the first interaction
 * started by BackendApp (checkPayment)
 * For the next messages, BackendApp will provide the same codiceContestoPagamento
 * @return {Either<Error,CodiceContestoPagamento>} The generated id or an internal error
 */
function generateCodiceContestoPagamento(): CodiceContestoPagamento {
  return uuid.v1() as CodiceContestoPagamento;
}
