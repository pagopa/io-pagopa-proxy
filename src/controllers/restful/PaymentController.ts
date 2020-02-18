/**
 * PaymentControllers
 * RESTful Controllers for Payments Endpoints
 */

import * as express from "express";
import { isLeft } from "fp-ts/lib/Either";
import { PathReporter } from "io-ts/lib/PathReporter";
import { RptId, RptIdFromString } from "italia-pagopa-commons/lib/pagopa";
import { TypeofApiResponse } from "italia-ts-commons/lib/requests";
import {
  ResponseErrorFromValidationErrors,
  ResponseErrorInternal,
  ResponseErrorNotFound,
  ResponseErrorValidation,
  ResponseSuccessJson
} from "italia-ts-commons/lib/responses";
import * as redis from "redis";
import * as uuid from "uuid";

import { CodiceContestoPagamento } from "../../../generated/api/CodiceContestoPagamento";
import { PaymentActivationsGetResponse } from "../../../generated/api/PaymentActivationsGetResponse";
import { PaymentActivationsPostRequest } from "../../../generated/api/PaymentActivationsPostRequest";
import { PaymentActivationsPostResponse } from "../../../generated/api/PaymentActivationsPostResponse";
import { PaymentFaultEnum } from "../../../generated/api/PaymentFault";
import { PaymentRequestsGetResponse } from "../../../generated/api/PaymentRequestsGetResponse";
import {
  ActivatePaymentT,
  GetActivationStatusT,
  GetPaymentInfoT
} from "../../../generated/api/requestTypes";
import { cdInfoWisp_ppt } from "../../../generated/FespCdService/cdInfoWisp_ppt";
import { cdInfoWispResponse_ppt } from "../../../generated/FespCdService/cdInfoWispResponse_ppt";
import { faultBean_ppt } from "../../../generated/PagamentiTelematiciPspNodoservice/faultBean_ppt";
import { PagoPAConfig } from "../../Configuration";
import * as PPTPortClient from "../../services/pagopa_api/PPTPortClient";
import * as PaymentsService from "../../services/PaymentsService";
import { logger } from "../../utils/Logger";
import * as PaymentsConverter from "../../utils/PaymentsConverter";
import { redisGet, redisSet } from "../../utils/Redis";
import {
  AsControllerFunction,
  AsControllerResponseType
} from "../../utils/types";

const getGetPaymentInfoController: (
  pagoPAConfig: PagoPAConfig,
  pagoPAClient: PPTPortClient.PagamentiTelematiciPspNodoAsyncClient
) => AsControllerFunction<GetPaymentInfoT> = (
  pagoPAConfig,
  pagoPAClient
) => async params => {
  // Validate rptId (payment identifier) provided by BackendApp
  const errorOrRptId = RptIdFromString.decode(params.rptId);
  if (isLeft(errorOrRptId)) {
    const error = errorOrRptId.value;
    logger.error(
      `GetPaymentInfo|Cannot decode rptid|${params.rptId}|${PathReporter.report(
        errorOrRptId
      )}`
    );
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
  const errorOrInodoVerificaRPTInput = PaymentsConverter.getNodoVerificaRPTInput(
    pagoPAConfig,
    rptId,
    codiceContestoPagamento
  );
  if (isLeft(errorOrInodoVerificaRPTInput)) {
    const error = errorOrInodoVerificaRPTInput.value;
    logger.error(
      `GetPaymentInfo|Cannot construct request|${params.rptId}|${error.message}`
    );
    return ResponseErrorValidation(
      "Invalid PagoPA check Request",
      error.message
    );
  }
  const iNodoVerificaRPTInput = errorOrInodoVerificaRPTInput.value;

  // Send the SOAP request to PagoPA (VerificaRPT message)
  const errorOrInodoVerificaRPTOutput = await PaymentsService.sendNodoVerificaRPTInput(
    iNodoVerificaRPTInput,
    pagoPAClient
  );
  if (isLeft(errorOrInodoVerificaRPTOutput)) {
    const error = errorOrInodoVerificaRPTOutput.value;
    logger.error(
      `GetPaymentInfo|Error while calling pagopa|${params.rptId}|${
        error.message
      }`
    );
    return ResponseErrorInternal(
      `PagoPA Server communication error: ${error.message}`
    );
  }
  const iNodoVerificaRPTOutput = errorOrInodoVerificaRPTOutput.value;

  // Check PagoPA response content
  if (iNodoVerificaRPTOutput.esito !== "OK") {
    // If it contains a functional error, an HTTP error will be provided to BackendApp
    const responseError = getResponseErrorIfExists(
      iNodoVerificaRPTOutput.fault
    );
    logger.error(
      `GetPaymentInfo|Error from pagopa|${
        params.rptId
      }|${responseError}|${JSON.stringify(iNodoVerificaRPTOutput.fault)}`
    );
    if (responseError === undefined) {
      return ResponseErrorInternal("Error during payment check: esito === KO");
    } else {
      return ResponseErrorInternal(responseError);
    }
  }

  // Convert the output provided by PagoPA (SOAP response)
  // to a BackendApp response (RESTful response), mapping the result information.
  // Send a response to BackendApp
  const responseOrError = PaymentsConverter.getPaymentRequestsGetResponse(
    iNodoVerificaRPTOutput,
    codiceContestoPagamento
  );

  if (isLeft(responseOrError)) {
    logger.error(
      `GetPaymentInfo|Cannot construct valid response|${
        params.rptId
      }|${PathReporter.report(responseOrError)}`
    );
    return ResponseErrorFromValidationErrors(PaymentRequestsGetResponse)(
      responseOrError.value
    );
  }

  return ResponseSuccessJson(responseOrError.value);
};

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
) => Promise<AsControllerResponseType<TypeofApiResponse<GetPaymentInfoT>>> {
  const controller = getGetPaymentInfoController(pagoPAConfig, pagoPAClient);
  return async req =>
    controller({
      rptId: req.params.rptId
    });
}

const getActivatePaymentController: (
  pagoPAConfig: PagoPAConfig,
  pagoPAClient: PPTPortClient.PagamentiTelematiciPspNodoAsyncClient
) => AsControllerFunction<ActivatePaymentT> = (
  pagoPAConfig,
  pagoPAClient
) => async params => {
  // Convert the input provided by BackendApp (RESTful request)
  // to a PagoPA request (SOAP request), mapping useful information
  // Some static information will be obtained by PagoPAConfig, to identify this client
  // If something wrong into input will be detected during mapping, and error will be provided as response
  const errorOrNodoAttivaRPTInput = PaymentsConverter.getNodoAttivaRPTInput(
    pagoPAConfig,
    params.paymentActivationsPostRequest
  );
  if (isLeft(errorOrNodoAttivaRPTInput)) {
    const error = errorOrNodoAttivaRPTInput.value;
    logger.error(`ActivatePayment|Invalid request|${error}`);
    return ResponseErrorValidation(
      "Invalid PagoPA activation Request",
      error.message
    );
  }
  const nodoAttivaRPTInput = errorOrNodoAttivaRPTInput.value;
  const rptId = params.paymentActivationsPostRequest.rptId;

  // Send the SOAP request to PagoPA (AttivaRPT message)
  const errorOrInodoAttivaRPTOutput = await PaymentsService.sendNodoAttivaRPTInputToPagoPa(
    nodoAttivaRPTInput,
    pagoPAClient
  );
  if (isLeft(errorOrInodoAttivaRPTOutput)) {
    const error = errorOrInodoAttivaRPTOutput.value;
    logger.error(
      `ActivatePayment|${rptId}|Cannot decode response from pagopa|${error}`
    );
    return ResponseErrorInternal(
      `PagoPA Server communication error: ${error.message}`
    );
  }
  const iNodoAttivaRPTOutput = errorOrInodoAttivaRPTOutput.value;

  // Check PagoPA response content.
  if (iNodoAttivaRPTOutput.esito !== "OK") {
    // If it contains a functional error, an HTTP error will be provided to BackendApp
    const responseError = getResponseErrorIfExists(iNodoAttivaRPTOutput.fault);
    logger.error(
      `ActivatePayment|${rptId}|Error from pagopa|${responseError}|${JSON.stringify(
        iNodoAttivaRPTOutput.fault
      )}`
    );
    if (responseError === undefined) {
      return ResponseErrorInternal(
        "Error during payment activate: esito === KO"
      );
    } else {
      return ResponseErrorInternal(responseError);
    }
  }

  // Convert the output provided by PagoPA (SOAP response)
  // to a BackendApp response (RESTful response), mapping the result information.
  // Send a response to BackendApp
  const responseOrError = PaymentsConverter.getPaymentActivationsPostResponse(
    iNodoAttivaRPTOutput
  );

  if (isLeft(responseOrError)) {
    logger.error(
      `ActivatePayment|${rptId}|Cannot construct valid response|${PathReporter.report(
        responseOrError
      )}`
    );
    return ResponseErrorFromValidationErrors(PaymentActivationsPostResponse)(
      responseOrError.value
    );
  }

  return ResponseSuccessJson(responseOrError.value);
};

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
) => Promise<AsControllerResponseType<TypeofApiResponse<ActivatePaymentT>>> {
  const controller = getActivatePaymentController(pagoPAConfig, pagoPAClient);
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
    return controller({ paymentActivationsPostRequest });
  };
}

/**
 * This controller is invoked by PagoPA that provides a paymentId
 * related to a previous async request (attivaRPT)
 * It just store this information into redis db. This information will be retrieved by App using polling
 * @param {cdInfoWisp_ppt} cdInfoWisp_ppt - The request from PagoPA
 * @param {number} redisTimeoutSecs - The expiration timeout for the information to store
 * @param {RedisClient} redisClient - The redis client used to store the paymentId
 * @return {Promise<IResponse*>} The response content to send to applicant
 */
export async function setActivationStatus(
  cdInfoWispInput: cdInfoWisp_ppt,
  redisTimeoutSecs: number,
  redisClient: redis.RedisClient
): Promise<cdInfoWispResponse_ppt> {
  return (await redisSet(
    redisClient,
    cdInfoWispInput.codiceContestoPagamento,
    cdInfoWispInput.idPagamento,
    "EX", // Set the specified expire time, in seconds.
    redisTimeoutSecs
  )).fold<cdInfoWispResponse_ppt>(
    _ => ({
      esito: "KO"
    }),
    _ => ({
      esito: "OK"
    })
  );
}

const getGetActivationStatusController: (
  redisClient: redis.RedisClient
) => AsControllerFunction<
  GetActivationStatusT
> = redisClient => async params => {
  // Retrieve idPayment related to a codiceContestoPagamento from DB
  // It's just a key-value mapping

  const maybeIdPaymentOrError = await redisGet(
    redisClient,
    params.codiceContestoPagamento
  );

  if (maybeIdPaymentOrError.isLeft()) {
    return ResponseErrorInternal(
      `getActivationStatus: ${maybeIdPaymentOrError.value}`
    );
  }

  const maybeIdPayment = maybeIdPaymentOrError.value;

  if (maybeIdPayment.isNone()) {
    return ResponseErrorNotFound("Not found", "getActivationStatus");
  }

  const idPayment = maybeIdPayment.value;

  const responseOrError = PaymentActivationsGetResponse.decode({
    idPagamento: idPayment
  });

  if (responseOrError.isLeft()) {
    return ResponseErrorFromValidationErrors(PaymentActivationsGetResponse)(
      responseOrError.value
    );
  }

  return ResponseSuccessJson(responseOrError.value);
};

/**
 * This controller is invoked by BackendApp to check the status of a previous activation request (async process)
 * If PagoPA sent an activation result (via cdInfoWisp), a paymentId will be retrieved into redis
 * The paymentId is necessary for App to proceed with the payment process
 * @param {redis.RedisClient} redisClient - The redis client used to retrieve the paymentId
 * @return {Promise<IResponse*>} The response content to send to applicant
 */
export function getActivationStatus(
  redisClient: redis.RedisClient
): (
  req: express.Request
) => Promise<
  AsControllerResponseType<TypeofApiResponse<GetActivationStatusT>>
> {
  const controller = getGetActivationStatusController(redisClient);
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
    return controller({
      codiceContestoPagamento
    });
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

/**
 * Parse a PagoPa response to check if it contains functional errors.
 * If error is found, it is mapped into a controller response for BackendApp
 * @param {string} esito - The esito (OK or KO) provided by PagoPa
 * @param {string} faultBean - Optional information provided by PagoPa in case of error
 * @return {IResponseErrorGeneric | IResponseErrorInternal} A controller response or undefined if no errors exist
 */
export function getResponseErrorIfExists(
  faultBean: faultBean_ppt | undefined
): PaymentFaultEnum | undefined {
  // Response is FAILED but no additional information are provided by PagoPa
  if (faultBean === undefined) {
    return undefined;
  }
  return getErrorMessageCtrlFromPagoPaError(
    faultBean.id,
    faultBean.faultCode,
    faultBean.description,
    faultBean.originalFaultCode
  );
}

/**
 * Convert PagoPa message error (faultCode) to Controller message error (ErrorMessagesCtrlEnum) to send to BackendApp
 * A complete list of faultCode provided by PagoPa is available at
 * https://www.agid.gov.it/sites/default/files/repository_files/specifiche_attuative_nodo_2_1_0.pdf
 * @param {string} faultId - Error Id provided by PagoPa to
 * @param {string} faultCode - Error code provided by PagoPa
 * @return {PaymentFaultEnum} Error code to send to BackendApp
 */
export function getErrorMessageCtrlFromPagoPaError(
  faultId: string,
  faultCode: string,
  faultDescription: string | undefined,
  originalFaultCode: string | undefined
): PaymentFaultEnum {
  switch (faultCode) {
    case "PPT_ERRORE_EMESSO_DA_PAA":
      return getErrorMessageFromPA(originalFaultCode);
    case "PPT_DOMINIO_SCONOSCIUTO":
      return PaymentFaultEnum.DOMAIN_UNKNOWN;
    default:
      // faultCode doesn't match anything
      logger.warn(
        `Retrieved a generic PagoPA error from ${faultId} response: (FaultCode: ${faultCode} - Description: ${faultDescription})`
      );
      return PaymentFaultEnum.PAYMENT_UNAVAILABLE;
  }
}

function getErrorMessageFromPA(
  originalFaultCode: string | undefined
): PaymentFaultEnum {
  switch (originalFaultCode) {
    case "PAA_ATTIVA_RPT_IMPORTO_NON_VALIDO":
      return PaymentFaultEnum.INVALID_AMOUNT;
    case "PAA_PAGAMENTO_DUPLICATO":
      return PaymentFaultEnum.PAYMENT_DUPLICATED;
    case "PAA_PAGAMENTO_IN_CORSO":
      return PaymentFaultEnum.PAYMENT_ONGOING;
    case "PAA_PAGAMENTO_SCADUTO":
      return PaymentFaultEnum.PAYMENT_EXPIRED;
    case "PAA_PAGAMENTO_SCONOSCIUTO":
      return PaymentFaultEnum.PAYMENT_UNKNOWN;
    case "PPT_DOMINIO_SCONOSCIUTO":
      return PaymentFaultEnum.DOMAIN_UNKNOWN;
    default:
      // faultCode doesn't match anything
      logger.warn(`Unexpected originalFaultCode : ${originalFaultCode} from PA`);
      return PaymentFaultEnum.PAYMENT_UNAVAILABLE;
  }
}
