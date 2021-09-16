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
import {
  PaymentFaultV2,
  PaymentFaultV2Enum
} from "../../../generated/api/PaymentFaultV2";
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
import {
  nodoActivateIOPaymentService,
  nodoVerifyPaymentNoticeService
} from "../../services/Nm3Service";
import * as NodoNM3PortClient from "../../services/pagopa_api/NodoNM3PortClient";
import * as PPTPortClient from "../../services/pagopa_api/PPTPortClient";
import * as PaymentsService from "../../services/PaymentsService";
import {
  EventNameEnum,
  EventResultEnum,
  trackPaymentEvent
} from "../../utils/AIUtils";
import { logger } from "../../utils/Logger";
import * as PaymentsConverter from "../../utils/PaymentsConverter";
import { redisGet, redisSet } from "../../utils/Redis";
import {
  AsControllerFunction,
  AsControllerResponseType,
  GeneralRptId,
  ResponsePaymentError
} from "../../utils/types";

// 1 - verificaCtrl
const getGetPaymentInfoController: (
  pagoPAConfig: PagoPAConfig,
  pagoPAClient: PPTPortClient.PagamentiTelematiciPspNodoAsyncClient,
  pagoPAClientNm3: NodoNM3PortClient.PagamentiTelematiciPspNm3NodoAsyncClient
) => AsControllerFunction<GetPaymentInfoT> = (
  pagoPAConfig,
  pagoPAClient,
  pagoPAClientNm3
) => async params => {
  // Validate rptId (payment identifier) provided by BackendApp
  const errorOrRptId = RptIdFromString.decode(params.rptId);
  if (isLeft(errorOrRptId)) {
    const error = errorOrRptId.value;

    const errorDetail = `GetPaymentInfo|Cannot decode rptid|${
      params.rptId
    }|${PathReporter.report(errorOrRptId)}`;
    logger.error(errorDetail);

    trackPaymentEvent({
      name: EventNameEnum.PAYMENT_VERIFY,
      properties: {
        rptId: params.rptId,
        result: EventResultEnum.INVALID_INPUT,
        detail: errorDetail
      }
    });
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

    const errorDetail = `GetPaymentInfo|Cannot construct request|${
      params.rptId
    }|${error.message}`;
    logger.error(errorDetail);

    trackPaymentEvent({
      name: EventNameEnum.PAYMENT_VERIFY,
      properties: {
        rptId: params.rptId,
        codiceContestoPagamento,
        result: EventResultEnum.INVALID_INPUT,
        detail: errorDetail
      }
    });
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

    const errorDetail = `GetPaymentInfo|Error while calling pagopa|${
      params.rptId
    }|${error.message}`;
    logger.error(errorDetail);

    trackPaymentEvent({
      name: EventNameEnum.PAYMENT_VERIFY,
      properties: {
        rptId: params.rptId,
        codiceContestoPagamento,
        result: EventResultEnum.CONNECTION_NODE,
        detail: errorDetail
      }
    });
    return ResponsePaymentError(
      PaymentFaultEnum.GENERIC_ERROR,
      PaymentFaultV2Enum.GENERIC_ERROR
    );
  }
  const iNodoVerificaRPTOutput = errorOrInodoVerificaRPTOutput.value;

  // Check PagoPA response content
  if (iNodoVerificaRPTOutput.esito !== "OK") {
    // If it contains a functional error, an HTTP error will be provided to BackendApp
    const responseError = getResponseErrorIfExists(
      iNodoVerificaRPTOutput.fault
    );

    if (
      responseError === undefined ||
      iNodoVerificaRPTOutput.fault === undefined
    ) {
      const errorDetail = `GetPaymentInfo|Error during payment check: esito === KO${
        params.rptId
      }|${responseError}|${JSON.stringify(iNodoVerificaRPTOutput.fault)}`;
      logger.error(errorDetail);

      trackPaymentEvent({
        name: EventNameEnum.PAYMENT_VERIFY,
        properties: {
          rptId: params.rptId,
          codiceContestoPagamento,
          result: EventResultEnum.CONNECTION_NODE,
          detail: errorDetail
        }
      });
      return ResponsePaymentError(
        PaymentFaultEnum.GENERIC_ERROR,
        PaymentFaultV2Enum.GENERIC_ERROR
      );
    }

    if (responseError.toString() !== PaymentFaultEnum.PPT_MULTI_BENEFICIARIO) {
      logger.error(
        `GetPaymentInfo|Error from pagopa|${
          params.rptId
        }|${responseError}|${JSON.stringify(iNodoVerificaRPTOutput.fault)}`
      );

      const detailV2 = getDetailV2FromFaultCode(iNodoVerificaRPTOutput.fault);

      const errorDetail = `GetPaymentInfo|ResponseError (detail: ${responseError} - detail_v2: ${detailV2})`;
      logger.warn(errorDetail);

      trackPaymentEvent({
        name: EventNameEnum.PAYMENT_VERIFY,
        properties: {
          rptId: params.rptId,
          codiceContestoPagamento,
          result: EventResultEnum.ERROR_NODE,
          detail: errorDetail,
          detail_v2: detailV2
        }
      });

      return ResponsePaymentError(responseError, detailV2);
    } else {
      /**
       * Handler of Nuovo Modello 3 (nm3 - PPT_MULTI_BENEFICIARIO)
       */
      const geralRptId: GeneralRptId = {
        asString: params.rptId,
        asObject: rptId
      };
      return await nodoVerifyPaymentNoticeService(
        pagoPAConfig,
        pagoPAClientNm3,
        geralRptId,
        codiceContestoPagamento
      );
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
    const errorDetail = `GetPaymentInfo|Cannot construct valid response|${
      params.rptId
    }|${PathReporter.report(responseOrError)}`;

    logger.error(errorDetail);

    trackPaymentEvent({
      name: EventNameEnum.PAYMENT_VERIFY,
      properties: {
        rptId: params.rptId,
        codiceContestoPagamento,
        result: EventResultEnum.ERROR_NODE,
        detail: errorDetail
      }
    });
    return ResponseErrorFromValidationErrors(PaymentRequestsGetResponse)(
      responseOrError.value
    );
  }

  trackPaymentEvent({
    name: EventNameEnum.PAYMENT_VERIFY,
    properties: {
      rptId: params.rptId,
      codiceContestoPagamento,
      result: EventResultEnum.OK
    }
  });
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
export function getPaymentInfo( // 1 - verifica
  pagoPAConfig: PagoPAConfig,
  pagoPAClient: PPTPortClient.PagamentiTelematiciPspNodoAsyncClient,
  pagoPAClientNm3: NodoNM3PortClient.PagamentiTelematiciPspNm3NodoAsyncClient
): (
  req: express.Request
) => Promise<AsControllerResponseType<TypeofApiResponse<GetPaymentInfoT>>> {
  const controller = getGetPaymentInfoController(
    pagoPAConfig,
    pagoPAClient,
    pagoPAClientNm3
  );
  return async req =>
    controller({
      rptId: req.params.rptId
    });
}

// 2 - attivaCtrl
const getActivatePaymentController: (
  pagoPAConfig: PagoPAConfig,
  pagoPAClient: PPTPortClient.PagamentiTelematiciPspNodoAsyncClient,
  pagoPAClientNm3: NodoNM3PortClient.PagamentiTelematiciPspNm3NodoAsyncClient,
  redisClient: redis.RedisClient,
  redisTimeoutSecs: number
) => AsControllerFunction<ActivatePaymentT> = (
  pagoPAConfig,
  pagoPAClient,
  pagoPAClientNm3,
  redisClient,
  redisTimeoutSecs
) => async params => {
  const ccp: CodiceContestoPagamento =
    params.paymentActivationsPostRequest.codiceContestoPagamento;
  const amount: number =
    params.paymentActivationsPostRequest.importoSingoloVersamento;
  const rptId: string = params.paymentActivationsPostRequest.rptId;
  const rptIdObject: RptId = RptIdFromString.decode(rptId).getOrElseL(_ => {
    throw Error("Cannot parse rptId");
  });
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

    const errorDetail = `ActivatePayment|Invalid request|${error}`;

    logger.error(errorDetail);

    trackPaymentEvent({
      name: EventNameEnum.PAYMENT_ACTIVATION,
      properties: {
        rptId,
        codiceContestoPagamento: ccp,
        result: EventResultEnum.INVALID_INPUT,
        detail: errorDetail
      }
    });

    return ResponseErrorValidation(
      "Invalid PagoPA activation Request",
      error.message
    );
  }
  const nodoAttivaRPTInput = errorOrNodoAttivaRPTInput.value;

  // Send the SOAP request to PagoPA (AttivaRPT message)
  const errorOrInodoAttivaRPTOutput = await PaymentsService.sendNodoAttivaRPTInputToPagoPa(
    nodoAttivaRPTInput,
    pagoPAClient
  );
  if (isLeft(errorOrInodoAttivaRPTOutput)) {
    const error = errorOrInodoAttivaRPTOutput.value;

    const errorDetail = `ActivatePayment|${rptId}|Cannot decode response from pagopa|${error}`;

    logger.error(errorDetail);

    trackPaymentEvent({
      name: EventNameEnum.PAYMENT_ACTIVATION,
      properties: {
        rptId,
        codiceContestoPagamento: ccp,
        result: EventResultEnum.ERROR_NODE,
        detail: errorDetail
      }
    });
    return ResponsePaymentError(
      PaymentFaultEnum.GENERIC_ERROR,
      PaymentFaultV2Enum.GENERIC_ERROR
    );
  }
  const iNodoAttivaRPTOutput = errorOrInodoAttivaRPTOutput.value;

  // Check PagoPA response content
  if (iNodoAttivaRPTOutput.esito !== "OK") {
    // If it contains a functional error, an HTTP error will be provided to BackendApp
    const responseError = getResponseErrorIfExists(iNodoAttivaRPTOutput.fault);

    if (
      responseError === undefined ||
      iNodoAttivaRPTOutput.fault === undefined
    ) {
      const errorDetail = `GetPaymentInfo|Error during payment check: esito === KO${rptId}|${responseError}|${JSON.stringify(
        iNodoAttivaRPTOutput.fault
      )}`;

      logger.error(errorDetail);

      trackPaymentEvent({
        name: EventNameEnum.PAYMENT_ACTIVATION,
        properties: {
          rptId,
          codiceContestoPagamento: ccp,
          result: EventResultEnum.ERROR_NODE,
          detail: errorDetail
        }
      });
      return ResponsePaymentError(
        PaymentFaultEnum.GENERIC_ERROR,
        PaymentFaultV2Enum.GENERIC_ERROR
      );
    }

    if (responseError.toString() !== PaymentFaultEnum.PPT_MULTI_BENEFICIARIO) {
      logger.error(
        `ActivatePayment|Error from pagopa|${rptId}|${responseError}|${JSON.stringify(
          iNodoAttivaRPTOutput.fault
        )}`
      );

      const detailV2 = getDetailV2FromFaultCode(iNodoAttivaRPTOutput.fault);

      const errorDetail = `ActivatePayment|ResponseError (detail: ${responseError} - detail_v2: ${detailV2})`;
      logger.error(errorDetail);

      trackPaymentEvent({
        name: EventNameEnum.PAYMENT_ACTIVATION,
        properties: {
          rptId,
          codiceContestoPagamento: ccp,
          result: EventResultEnum.ERROR_NODE,
          detail: errorDetail,
          detail_v2: detailV2
        }
      });
      return ResponsePaymentError(responseError, detailV2);
    } else {
      /**
       * Handler of Nuovo Modello 3 (nm3 - PPT_MULTI_BENEFICIARIO)
       */

      const geralRptId: GeneralRptId = {
        asString: rptId,
        asObject: rptIdObject
      };

      return await nodoActivateIOPaymentService(
        pagoPAConfig,
        pagoPAClientNm3,
        redisClient,
        redisTimeoutSecs,
        ccp,
        geralRptId,
        amount
      );
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
export function activatePayment( // 2 - attiva
  pagoPAConfig: PagoPAConfig,
  pagoPAClient: PPTPortClient.PagamentiTelematiciPspNodoAsyncClient,
  pagoPAClientNm3: NodoNM3PortClient.PagamentiTelematiciPspNm3NodoAsyncClient,
  redisClient: redis.RedisClient,
  redisTimeoutSecs: number
): (
  req: express.Request
) => Promise<AsControllerResponseType<TypeofApiResponse<ActivatePaymentT>>> {
  const controller = getActivatePaymentController(
    pagoPAConfig,
    pagoPAClient,
    pagoPAClientNm3,
    redisClient,
    redisTimeoutSecs
  );
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

export async function setNm3PaymentOption(
  codiceContestoPagamento: CodiceContestoPagamento,
  idPayment: string,
  redisTimeoutSecs: number,
  redisClient: redis.RedisClient
): Promise<boolean> {
  return (await redisSet(
    redisClient,
    codiceContestoPagamento,
    idPayment,
    "EX", // Set the specified expire time, in seconds.
    redisTimeoutSecs
  )).fold<boolean>(_ => false, _ => true);
}

// 3 - getIdPagamentoCtrl
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
export function getActivationStatus( // 3 - getIdPagamento
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
 * @return {IResponseErrorGeneric | IResponsePaymentError} A controller response or undefined if no errors exist
 */
export function getResponseErrorIfExists(
  faultBean: faultBean_ppt | undefined
): PaymentFaultEnum | undefined {
  // Response is FAILED but no additional information are provided by PagoPa
  if (faultBean === undefined) {
    return undefined;
  }
  // Response is FAILED and additional information are provided by PagoPa
  return getErrorMessageCtrlFromPagoPaError(
    faultBean.faultCode,
    faultBean.description,
    faultBean.originalFaultCode
  );
}

/**
 * Convert PagoPa message error (faultCode) to Controller message error (ErrorMessagesCtrlEnum) to send to BackendApp
 * A complete list of faultCode provided by PagoPa is available at
 * https://www.agid.gov.it/sites/default/files/repository_files/specifiche_attuative_nodo_2_1_0.pdf
 * @param {string} faultCode - Error code provided by PagoPa
 * @return {PaymentFaultEnum} Error code to send to BackendApp
 */
export function getErrorMessageCtrlFromPagoPaError(
  faultCode: string,
  faultDescription: string | undefined,
  originalFaultCode?: string
): PaymentFaultEnum {
  switch (faultCode) {
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
    case "PPT_MULTI_BENEFICIARIO":
      return PaymentFaultEnum.PPT_MULTI_BENEFICIARIO;
    default:
      // if originalFaultCode exists
      if (originalFaultCode !== undefined) {
        return getErrorMessageCtrlFromPagoPaError(originalFaultCode, undefined);
      }
      if (faultDescription !== undefined) {
        // if there's a description, try to look for a fault code in the
        // description
        const extractedFaultCode = faultDescription.match(/(PAA|PPT)_\S+/);
        if (extractedFaultCode !== null) {
          return getErrorMessageCtrlFromPagoPaError(
            extractedFaultCode[0],
            undefined
          );
        }
      }
      logger.warn(
        `Retrieved a generic PagoPA error response: (FaultCode: ${faultCode} - Description: ${faultDescription})`
      );
      return PaymentFaultEnum.PAYMENT_UNAVAILABLE;
  }
}

/**
 * Retrive detail_v2 from PagoPa message error (faultCode)
 * @param {string} faultCode - Error code provided by PagoPa
 * @return {detail_v2} detail_v2 to send to BackendApp
 */
export function getDetailV2FromFaultCode(
  fault: faultBean_ppt
): PaymentFaultV2Enum {
  const maybeOriginalFaultCode = PaymentFaultV2.decode(fault.originalFaultCode);
  const maybeFaultCode = PaymentFaultV2.decode(fault.faultCode);
  const extractedValues = fault.faultString.match(/(PAA|PPT)_\S+/);
  const maybeExtractedFaultCode =
    extractedValues != null
      ? PaymentFaultV2.decode(extractedValues[0])
      : undefined;
  return maybeOriginalFaultCode.isRight()
    ? maybeOriginalFaultCode.value
    : maybeExtractedFaultCode && maybeExtractedFaultCode.isRight()
      ? maybeExtractedFaultCode.value
      : maybeFaultCode.isRight()
        ? maybeFaultCode.value
        : PaymentFaultV2Enum.GENERIC_ERROR;
}
