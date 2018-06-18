/**
 * PaymentControllers
 * RESTful Controllers for Payments Endpoints
 */

import * as express from "express";
import { isLeft } from "fp-ts/lib/Either";
import { clients as pagoPaSoapClient } from "italia-pagopa-api";
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
import { PagoPaConfig } from "../../Configuration";
import * as PaymentsService from "../../services/PaymentsService";
import { CodiceContestoPagamento } from "../../types/CodiceContestoPagamento";
import { PaymentsActivationRequest } from "../../types/PaymentsActivationRequest";
import { PaymentsActivationResponse } from "../../types/PaymentsActivationResponse";
import { PaymentsActivationStatusCheckResponse } from "../../types/PaymentsActivationStatusCheckResponse";
import { PaymentsCheckRequest } from "../../types/PaymentsCheckRequest";
import { PaymentsCheckResponse } from "../../types/PaymentsCheckResponse";
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
  // tslint:disable-next-line
  | IResponseErrorValidation
  | IResponseErrorGeneric
  | IResponseErrorInternal
  | IResponseSuccessJson<PaymentsCheckResponse>
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
      return ResponseErrorValidation(
        "Invalid PagoPa check Request",
        error.message
      );
    }
    const paymentCheckRequestPagoPa = errorOrPaymentCheckRequestPagoPa.value;

    // Send the SOAP request to PagoPa (VerificaRPT message)
    const errorOrPaymentCheckPagoPaResponse = await PaymentsService.sendPaymentCheckRequestToPagoPa(
      paymentCheckRequestPagoPa,
      paymentVerificaRPTPagoPaClient
    );
    if (isLeft(errorOrPaymentCheckPagoPaResponse)) {
      const error = errorOrPaymentCheckPagoPaResponse.value;
      return ResponseErrorInternal(
        `PagoPa Server communication error: ${error.message}`
      );
    }
    const paymentCheckPagoPaResponse = errorOrPaymentCheckPagoPaResponse.value;

    // Check PagoPa response content.
    // If it contains an error, an HTTP error will be provided to BackendApp
    if (
      paymentCheckPagoPaResponse.nodoVerificaRPTRisposta.esito ===
      PPTPortTypes.Esito.KO
    ) {
      return ResponseErrorInternal("Error during payment check: esito === KO");
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
      ResponseErrorFromValidationErrors(PaymentsCheckResponse),
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
    // to a PagoPa request (SOAP request), mapping useful information
    // Some static information will be obtained by pagoPaConfig, to identify this client
    // If something wrong into input will be detected during mapping, and error will be provided as response
    const errorOrPaymentsActivationRequestPagoPa = PaymentsConverter.getPaymentsActivationRequestPagoPa(
      pagoPaConfig,
      paymentsActivationRequest
    );
    if (isLeft(errorOrPaymentsActivationRequestPagoPa)) {
      const error = errorOrPaymentsActivationRequestPagoPa.value;
      return ResponseErrorValidation(
        "Invalid PagoPa activation Request",
        error.message
      );
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
      return ResponseErrorInternal(
        `PagoPa Server communication error: ${error.message}`
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
      return ResponseErrorInternal("Error during payment check: esito === KO");
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
      ResponseErrorFromValidationErrors(PaymentsActivationResponse),
      ResponseSuccessJson
    );
  };
}

/**
 * This controller is invoked by PagoPa that provides a paymentId
 * related to a previous async request (attivaRPT)
 * It just store this information into redis db. This information will be retrieved by App using polling
 * @param {IcdInfoPagamentoInput} cdInfoPagamentoInput - The request from PagoPa
 * @param {RedisTimeout} redisTimeout - The expiration timeout for the information to store
 * @param {RedisClient} redisClient - The redis client used to store the paymentId
 * @param {(cdInfoPagamentoOutput: IcdInfoPagamentoOutput) => void} callback - Callback function to send a feedback to PagoPa
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
 * If PagoPa sent an activation result (via cdInfoPagamento), a paymentId will be retrieved into redis
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
    // Validate codiceContestoPagamento (session token) data provided by BackendApp
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
