/**
 * PaymentControllers
 * RESTful Controllers for Payments Endpoints
 */

import * as express from "express";
import { Either, fromOption, isLeft, left } from "fp-ts/lib/Either";
import { RptId, RptIdFromString } from "italia-ts-commons/lib/pagopa";
import {
  IResponseErrorGeneric,
  IResponseErrorInternal,
  IResponseErrorNotFound,
  IResponseErrorValidation,
  IResponseSuccessJson,
  ResponseErrorFromValidationErrors,
  ResponseErrorInternal,
  ResponseErrorNotFound,
  ResponseErrorValidation,
  ResponseSuccessJson
} from "italia-ts-commons/lib/responses";
import * as redis from "redis";
import * as uuid from "uuid";
import { PagoPAConfig } from "../../Configuration";
import * as PPTPortClient from "../../services/pagopa_api/PPTPortClient";
import * as PaymentsService from "../../services/PaymentsService";
import { CodiceContestoPagamento } from "../../types/api/CodiceContestoPagamento";
import { PaymentActivationsGetResponse } from "../../types/api/PaymentActivationsGetResponse";
import { PaymentActivationsPostRequest } from "../../types/api/PaymentActivationsPostRequest";
import { PaymentActivationsPostResponse } from "../../types/api/PaymentActivationsPostResponse";
import { PaymentRequestsGetResponse } from "../../types/api/PaymentRequestsGetResponse";
import { cdInfoPagamento_ppt } from "../../types/pagopa_api/yaml-to-ts/cdInfoPagamento_ppt";
import { cdInfoPagamentoResponse_ppt } from "../../types/pagopa_api/yaml-to-ts/cdInfoPagamentoResponse_ppt";
import * as PaymentsConverter from "../../utils/PaymentsConverter";
import { redisGet, redisSet } from "../../utils/Redis";

/**
 * This controller is invoked by BackendApp
 * to retrieve information about a payment.
 * It asks PagoPA for payment information using VerificaRPT service.
 * @param {express.Request} req - The RESTful request
 * @param {PagoPAConfig} pagoPAConfig - Configuration about PagoPA WS to contact
 * @return {Promise<PaymentCtrlResponse<PaymentsActivationResponse>>} The response content to send to applicant
 */
export function getPaymentInfo(
  pagoPAConfig: PagoPAConfig,
  pagoPAClient: PPTPortClient.PagamentiTelematiciPspNodoAsyncClient
): (
  req: express.Request
) => Promise<
  | IResponseErrorValidation
  | IResponseErrorGeneric
  | IResponseErrorInternal
  | IResponseSuccessJson<PaymentRequestsGetResponse>
> {
  return async req => {
    // Validate rptId (payment identifier) provided by BackendApp
    const errorOrRptId = RptIdFromString.decode(req.params.rptId);
    if (isLeft(errorOrRptId)) {
      const error = errorOrRptId.value;
      return ResponseErrorFromValidationErrors(RptId)(error);
    }
    const rptId = errorOrRptId.value;

    // Generate a Transaction ID called CodiceContestoPagamento
    // to follow a stream of requests with PagoPA.
    // It will be generated here after the first interaction
    // started by BackendApp (checkPayment)
    // For the next messages, BackendApp will provide the same codiceContestoPagamento
    const codiceContestoPagamento = generateCodiceContestoPagamento();

    // Convert the input provided by BackendApp (RESTful request) to a PagoPA request (SOAP request).
    // Some static information will be obtained by PagoPAConfig, to identify this client.
    const errorOrInodoVerificaRPTInput = PaymentsConverter.getInodoVerificaRPTInput(
      pagoPAConfig,
      rptId,
      codiceContestoPagamento
    );
    if (isLeft(errorOrInodoVerificaRPTInput)) {
      const error = errorOrInodoVerificaRPTInput.value;
      return ResponseErrorValidation(
        "Invalid PagoPA check Request",
        error.message
      );
    }
    const iNodoVerificaRPTInput = errorOrInodoVerificaRPTInput.value;

    // Send the SOAP request to PagoPA (VerificaRPT message)
    const errorOrInodoVerificaRPTOutput = await PaymentsService.sendInodoVerificaRPTInput(
      iNodoVerificaRPTInput,
      pagoPAClient
    );
    if (isLeft(errorOrInodoVerificaRPTOutput)) {
      const error = errorOrInodoVerificaRPTOutput.value;
      return ResponseErrorInternal(
        `PagoPA Server communication error: ${error.message}`
      );
    }
    const iNodoVerificaRPTOutput = errorOrInodoVerificaRPTOutput.value;
    // Check PagoPA response content.
    // If it contains an error, an HTTP error will be provided to BackendApp
    if (iNodoVerificaRPTOutput.esito === "KO") {
      return ResponseErrorInternal("Error during payment check: esito === KO");
    }

    // Convert the output provided by PagoPA (SOAP response)
    // to a BackendApp response (RESTful response), mapping the result information.
    // Send a response to BackendApp
    return PaymentsConverter.getPaymentRequestsGetResponse(
      iNodoVerificaRPTOutput,
      codiceContestoPagamento
    ).fold<
      | IResponseErrorValidation
      | IResponseSuccessJson<PaymentRequestsGetResponse>
    >(
      ResponseErrorFromValidationErrors(PaymentRequestsGetResponse),
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
 * @return {Promise<PaymentCtrlResponse<PaymentActivationsPostRequest>>} The response content to send to applicant
 */
export function activatePayment(
  pagoPAConfig: PagoPAConfig,
  pagoPAClient: PPTPortClient.PagamentiTelematiciPspNodoAsyncClient
): (
  req: express.Request
) => Promise<
  | IResponseErrorValidation
  | IResponseErrorGeneric
  | IResponseErrorInternal
  | IResponseSuccessJson<PaymentActivationsPostResponse>
> {
  return async req => {
    // Validate input provided by BackendAp
    const errorOrPaymentActivationsPostRequest = PaymentActivationsPostRequest.decode(
      req.body
    );
    if (isLeft(errorOrPaymentActivationsPostRequest)) {
      const error = errorOrPaymentActivationsPostRequest.value;
      return ResponseErrorFromValidationErrors(PaymentActivationsPostRequest)(
        error
      );
    }
    const paymentActivationsPostRequest =
      errorOrPaymentActivationsPostRequest.value;

    // Convert the input provided by BackendApp (RESTful request)
    // to a PagoPA request (SOAP request), mapping useful information
    // Some static information will be obtained by PagoPAConfig, to identify this client
    // If something wrong into input will be detected during mapping, and error will be provided as response
    const errorOrInodoAttivaRPTInput = PaymentsConverter.getInodoAttivaRPTInput(
      pagoPAConfig,
      paymentActivationsPostRequest
    );
    if (isLeft(errorOrInodoAttivaRPTInput)) {
      const error = errorOrInodoAttivaRPTInput.value;
      return ResponseErrorValidation(
        "Invalid PagoPA activation Request",
        error.message
      );
    }
    const iNodoAttivaRPTInput = errorOrInodoAttivaRPTInput.value;

    // Send the SOAP request to PagoPA (AttivaRPT message)
    const errorOrInodoAttivaRPTOutput = await PaymentsService.sendInodoAttivaRPTInputToPagoPa(
      iNodoAttivaRPTInput,
      pagoPAClient
    );
    if (isLeft(errorOrInodoAttivaRPTOutput)) {
      const error = errorOrInodoAttivaRPTOutput.value;
      return ResponseErrorInternal(
        `PagoPA Server communication error: ${error.message}`
      );
    }
    const iNodoAttivaRPTOutput = errorOrInodoAttivaRPTOutput.value;

    // Check PagoPA response content.
    // If it contains an error, an HTTP error will be provided to BackendApp
    if (iNodoAttivaRPTOutput.esito === "KO") {
      return ResponseErrorInternal("Error during payment check: esito === KO");
    }

    // Convert the output provided by PagoPA (SOAP response)
    // to a BackendApp response (RESTful response), mapping the result information.
    // Send a response to BackendApp
    return PaymentsConverter.getPaymentActivationsPostResponse(
      iNodoAttivaRPTOutput
    ).fold<
      | IResponseErrorValidation
      | IResponseSuccessJson<PaymentActivationsPostResponse>
    >(
      ResponseErrorFromValidationErrors(PaymentActivationsPostResponse),
      ResponseSuccessJson
    );
  };
}

/**
 * This controller is invoked by PagoPA that provides a paymentId
 * related to a previous async request (attivaRPT)
 * It just store this information into redis db. This information will be retrieved by App using polling
 * @param {cdInfoPagamento_ppt} cdInfoPagamento_ppt - The request from PagoPA
 * @param {number} redisTimeoutSecs - The expiration timeout for the information to store
 * @param {RedisClient} redisClient - The redis client used to store the paymentId
 * @return {Promise<IResponse*>} The response content to send to applicant
 */
export async function setActivationStatus(
  cdInfoPagamentoInput: cdInfoPagamento_ppt,
  redisTimeoutSecs: number,
  redisClient: redis.RedisClient
): Promise<cdInfoPagamentoResponse_ppt> {
  return (await redisSet(
    redisClient,
    cdInfoPagamentoInput.codiceContestoPagamento,
    cdInfoPagamentoInput.idPagamento,
    "EX", // Set the specified expire time, in seconds.
    redisTimeoutSecs
  )).fold<cdInfoPagamentoResponse_ppt>(
    _ => ({
      esito: "KO"
    }),
    _ => ({
      esito: "OK"
    })
  );
}

/**
 * This controller is invoked by BackendApp to check the status of a previous activation request (async process)
 * If PagoPA sent an activation result (via cdInfoPagamento), a paymentId will be retrieved into redis
 * The paymentId is necessary for App to proceed with the payment process
 * @param {redis.RedisClient} redisClient - The redis client used to retrieve the paymentId
 * @return {Promise<IResponse*>} The response content to send to applicant
 */
export function getActivationStatus(
  redisClient: redis.RedisClient
): (
  req: express.Request
) => Promise<
  | IResponseErrorValidation
  | IResponseErrorGeneric
  | IResponseErrorInternal
  | IResponseErrorNotFound
  | IResponseSuccessJson<PaymentActivationsGetResponse>
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

    // Retrieve idPayment related to a codiceContestoPagamento from DB
    // It's just a key-value mapping
    return (await redisGet(redisClient, codiceContestoPagamento))
      .fold<Either<IResponseErrorNotFound | IResponseErrorInternal, string>>(
        error => left(ResponseErrorInternal(`getActivationStatus: ${error}`)),
        maybeIdPagamento =>
          fromOption(ResponseErrorNotFound("Not found", "getActivationStatus"))(
            maybeIdPagamento
          )
      )
      .fold<
        | IResponseErrorValidation
        | IResponseErrorGeneric
        | IResponseErrorInternal
        | IResponseErrorNotFound
        | IResponseSuccessJson<PaymentActivationsGetResponse>
      >(
        errorResponse => errorResponse,
        // Define a response to send to the applicant containing an error or the retrieved data
        idPagamento =>
          PaymentActivationsGetResponse.decode({
            idPagamento
          }).fold<
            | IResponseErrorValidation
            | IResponseSuccessJson<PaymentActivationsGetResponse>
          >(
            ResponseErrorFromValidationErrors(PaymentActivationsGetResponse),
            ResponseSuccessJson
          )
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
  return uuid.v1().replace(/-/g, "") as CodiceContestoPagamento;
}
