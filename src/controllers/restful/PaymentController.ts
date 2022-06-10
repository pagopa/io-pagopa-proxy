/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable @typescript-eslint/no-use-before-define */
/**
 * PaymentControllers
 * RESTful Controllers for Payments Endpoints
 */
import * as express from "express";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import * as t from "io-ts";
import { PathReporter } from "io-ts/lib/PathReporter";
import { TypeofApiResponse } from "@pagopa/ts-commons/lib/requests";
import {
  IResponseErrorValidation,
  ResponseErrorFromValidationErrors,
  ResponseErrorNotFound,
  ResponseErrorValidation,
  ResponseSuccessJson
} from "@pagopa/ts-commons/lib/responses";
import * as redis from "redis";
import * as uuid from "uuid";

import { pipe } from "fp-ts/lib/function";
import { CodiceContestoPagamento } from "../../../generated/api/CodiceContestoPagamento";
import { ImportoEuroCents } from "../../../generated/api/ImportoEuroCents";
import { PaymentActivationsGetResponse } from "../../../generated/api/PaymentActivationsGetResponse";
import { PaymentActivationsPostRequest } from "../../../generated/api/PaymentActivationsPostRequest";
import { PaymentActivationsPostResponse } from "../../../generated/api/PaymentActivationsPostResponse";
import {
  PaymentFault,
  PaymentFaultEnum
} from "../../../generated/api/PaymentFault";
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
import { cdInfoWisp_element_ppt } from "../../../generated/FespCdService/cdInfoWisp_element_ppt";
import { cdInfoWispResponse_element_ppt } from "../../../generated/FespCdService/cdInfoWispResponse_element_ppt";
import { faultBean_type_ppt } from "../../../generated/PagamentiTelematiciPspNodoservice/faultBean_type_ppt";
import {
  NodeClientConfig,
  NodeClientEnum,
  NodeClientType,
  PagoPAConfig
} from "../../Configuration";
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
  ResponseGatewayTimeout,
  ResponsePaymentError
} from "../../utils/types";
import { RptId, RptIdFromString } from "../../utils/pagopa";
import { responseFromPaymentFault } from "../../utils/responses";
import { GatewayFaultEnum } from "../../../generated/api/GatewayFault";
import {
  FaultCategory,
  FaultCategoryEnum
} from "../../../generated/api/FaultCategory";

const headerValidationErrorHandler: (
  e: ReadonlyArray<t.ValidationError>
) => Promise<IResponseErrorValidation> = async e =>
  ResponseErrorValidation(
    "Invalid X-Client-Id",
    e.map(err => err.message).join("\n")
  );

// 1. verificaCtrl
const getGetPaymentInfoController: (
  pagoPAConfig: PagoPAConfig,
  pagoPAClient: PPTPortClient.PagamentiTelematiciPspNodoAsyncClient,
  pagoPAClientNm3: NodoNM3PortClient.PagamentiTelematiciPspNm3NodoAsyncClient
) => // eslint-disable-next-line max-lines-per-function
AsControllerFunction<GetPaymentInfoT> = (
  pagoPAConfig,
  pagoPAClient,
  pagoPAClientNm3
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type, max-lines-per-function
) => async (
  params
): Promise<AsControllerResponseType<TypeofApiResponse<GetPaymentInfoT>>> => {
  const clientId = params["x-Client-Id"] as NodeClientType;

  logger.info(`GetPaymentInfo|${clientId}|${params.rpt_id_from_string}`);

  // Validate rptId (payment identifier) provided by BackendApp
  const errorOrRptId = RptIdFromString.decode(params.rpt_id_from_string);
  if (E.isLeft(errorOrRptId)) {
    const error = errorOrRptId.left;

    const errorDetail = `GetPaymentInfo|Cannot decode rptid|${clientId}|${
      params.rpt_id_from_string
    }|${PathReporter.report(errorOrRptId)}`;
    logger.error(errorDetail);

    trackPaymentEvent({
      name: EventNameEnum.PAYMENT_VERIFY,
      properties: {
        clientId,
        detail: errorDetail,
        result: EventResultEnum.INVALID_INPUT,
        rptId: params.rpt_id_from_string
      }
    });
    return ResponseErrorFromValidationErrors(RptId)(error);
  }
  const rptId = errorOrRptId.right;

  // Generate a Transaction ID called CodiceContestoPagamento
  // to follow a stream of requests with PagoPA.
  // It will be generated here after the first interaction
  // started by BackendApp (checkPayment)
  // For the next messages, BackendApp will provide the same codiceContestoPagamento
  const codiceContestoPagamento = generateCodiceContestoPagamento();

  // Some static information will be obtained by PagoPAConfig, to identify this client.
  const nodeClientConfig: NodeClientConfig =
    NodeClientEnum.CLIENT_IO === clientId
      ? pagoPAConfig.IDENTIFIERS.CLIENT_IO
      : pagoPAConfig.IDENTIFIERS.CLIENT_CHECKOUT;

  // Convert the input provided by BackendApp (RESTful request) to a PagoPA request (SOAP request).
  const errorOrInodoVerificaRPTInput = PaymentsConverter.getNodoVerificaRPTInput(
    nodeClientConfig,
    rptId,
    codiceContestoPagamento
  );
  if (E.isLeft(errorOrInodoVerificaRPTInput)) {
    const error = errorOrInodoVerificaRPTInput.left;

    const errorDetail = `GetPaymentInfo|Cannot construct request|${clientId}|${params.rpt_id_from_string}|${error.message}`;
    logger.error(errorDetail);

    trackPaymentEvent({
      name: EventNameEnum.PAYMENT_VERIFY,
      properties: {
        clientId,
        codiceContestoPagamento,
        detail: errorDetail,
        result: EventResultEnum.INVALID_INPUT,
        rptId: params.rpt_id_from_string
      }
    });
    return ResponseErrorValidation(
      "Invalid PagoPA check Request",
      error.message
    );
  }
  const iNodoVerificaRPTInput = errorOrInodoVerificaRPTInput.right;

  // Send the SOAP request to PagoPA (VerificaRPT message)
  const errorOrInodoVerificaRPTOutput = await PaymentsService.sendNodoVerificaRPTInput(
    iNodoVerificaRPTInput,
    pagoPAClient
  );
  if (E.isLeft(errorOrInodoVerificaRPTOutput)) {
    const error = errorOrInodoVerificaRPTOutput.left;

    const errorDetail = `GetPaymentInfo|Error while calling pagopa|${clientId}|${params.rpt_id_from_string}|${error.message}`;
    logger.error(errorDetail);

    trackPaymentEvent({
      name: EventNameEnum.PAYMENT_VERIFY,
      properties: {
        clientId,
        codiceContestoPagamento,
        detail: errorDetail,
        result: EventResultEnum.CONNECTION_NODE,
        rptId: params.rpt_id_from_string
      }
    });

    if (error.message === "ESOCKETTIMEDOUT") {
      return ResponseGatewayTimeout();
    } else {
      return ResponsePaymentError(
        FaultCategoryEnum.GENERIC_ERROR,
        PaymentFaultEnum.GENERIC_ERROR,
        GatewayFaultEnum.GENERIC_ERROR
      );
    }
  }
  const iNodoVerificaRPTOutput = errorOrInodoVerificaRPTOutput.right;

  // Check PagoPA response content
  if (iNodoVerificaRPTOutput.esito !== "OK") {
    // If it contains a functional error, an HTTP error will be provided to BackendApp
    const faultBean = iNodoVerificaRPTOutput.fault;
    const responseError = getResponseErrorIfExists(faultBean);

    if (responseError === undefined || faultBean === undefined) {
      const errorDetail = `GetPaymentInfo|Error during payment check: esito === KO|${clientId}|${
        params.rpt_id_from_string
      }|${responseError?.detail}|${JSON.stringify(faultBean)}`;
      logger.error(errorDetail);

      trackPaymentEvent({
        name: EventNameEnum.PAYMENT_VERIFY,
        properties: {
          clientId,
          codiceContestoPagamento,
          detail: errorDetail,
          result: EventResultEnum.CONNECTION_NODE,
          rptId: params.rpt_id_from_string
        }
      });
      return ResponsePaymentError(
        FaultCategoryEnum.GENERIC_ERROR,
        PaymentFaultEnum.GENERIC_ERROR,
        GatewayFaultEnum.GENERIC_ERROR
      );
    }

    if (
      responseError.detail.toString() !==
      PaymentFaultEnum.PPT_MULTI_BENEFICIARIO
    ) {
      logger.error(
        `GetPaymentInfo|Error from pagopa|${clientId}|${
          params.rpt_id_from_string
        }|${responseError.detail}|${JSON.stringify(faultBean)}`
      );

      const detailV2 = getDetailV2FromFaultCode(faultBean);

      const errorDetail = `GetPaymentInfo|ResponseError (detail: ${responseError.detail} - detail_v2: ${detailV2})`;
      logger.warn(errorDetail);

      trackPaymentEvent({
        name: EventNameEnum.PAYMENT_VERIFY,
        properties: {
          clientId,
          codiceContestoPagamento,
          detail: errorDetail,
          detail_v2: detailV2,
          result: EventResultEnum.ERROR_NODE,
          rptId: params.rpt_id_from_string
        }
      });

      return responseFromPaymentFault(responseError, detailV2);
    } else {
      /**
       * Handler of Nuovo Modello 3 (nm3 - PPT_MULTI_BENEFICIARIO)
       */
      const geralRptId: GeneralRptId = {
        asObject: rptId,
        asString: params.rpt_id_from_string
      };
      return await nodoVerifyPaymentNoticeService(
        clientId,
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

  if (E.isLeft(responseOrError)) {
    const errorDetail = `GetPaymentInfo|Cannot construct valid response|${clientId}|${
      params.rpt_id_from_string
    }|${PathReporter.report(responseOrError)}`;

    logger.error(errorDetail);

    trackPaymentEvent({
      name: EventNameEnum.PAYMENT_VERIFY,
      properties: {
        clientId,
        codiceContestoPagamento,
        detail: errorDetail,
        result: EventResultEnum.ERROR_NODE,
        rptId: params.rpt_id_from_string
      }
    });
    return ResponseErrorFromValidationErrors(PaymentRequestsGetResponse)(
      responseOrError.left
    );
  }

  trackPaymentEvent({
    name: EventNameEnum.PAYMENT_VERIFY,
    properties: {
      clientId,
      codiceContestoPagamento,
      result: EventResultEnum.OK,
      rptId: params.rpt_id_from_string
    }
  });
  return ResponseSuccessJson(responseOrError.right);
};

function getClientId(req: express.Request): t.Validation<string> {
  const clientId = O.fromNullable(req.header("X-Client-Id"));

  return pipe(
    clientId,
    E.fromOption(() => [
      {
        context: t.getDefaultContext(NodeClientType),
        message: "Missing X-Client-Id header",
        value: undefined
      }
    ]),
    E.chain(NodeClientType.decode)
  );
}

/**
 * This controller is invoked by BackendApp
 * to retrieve information about a payment.
 * It asks PagoPA for payment information using VerificaRPT service.
 *
 * @param {express.Request} req - The RESTful request
 * @param {PagoPAConfig} pagoPAConfig - Configuration about PagoPA WS to contact
 * @return {Promise<PaymentCtrlResponse<PaymentsActivationResponse>>} The response content to send to applicant
 */
export function getPaymentInfo(
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
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  return async req => {
    const clientId = getClientId(req);

    type HandlerReturnType = Promise<
      AsControllerResponseType<TypeofApiResponse<GetPaymentInfoT>>
    >;
    const responseHandler: (id: string) => HandlerReturnType = id =>
      controller({
        rpt_id_from_string: req.params.rpt_id_from_string,
        "x-Client-Id": id
      });

    return pipe(
      clientId,
      E.fold(headerValidationErrorHandler, responseHandler)
    );
  };
}

// 2. attivaCtrl
const getActivatePaymentController: (
  pagoPAConfig: PagoPAConfig,
  pagoPAClient: PPTPortClient.PagamentiTelematiciPspNodoAsyncClient,
  pagoPAClientNm3: NodoNM3PortClient.PagamentiTelematiciPspNm3NodoAsyncClient,
  redisClient: redis.RedisClient,
  redisTimeoutSecs: number
) => // eslint-disable-next-line max-lines-per-function
AsControllerFunction<ActivatePaymentT> = (
  pagoPAConfig,
  pagoPAClient,
  pagoPAClientNm3,
  redisClient,
  redisTimeoutSecs
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type, max-lines-per-function
) => async (
  params
): Promise<AsControllerResponseType<TypeofApiResponse<ActivatePaymentT>>> => {
  const ccp: CodiceContestoPagamento = params.body.codiceContestoPagamento;
  const amount: ImportoEuroCents = params.body.importoSingoloVersamento;
  const rptId: string = params.body.rptId;
  const rptIdObject: RptId = pipe(
    RptIdFromString.decode(rptId),
    E.getOrElseW(_ => {
      throw Error("Cannot parse rptId");
    })
  );
  const clientId = params["x-Client-Id"] as NodeClientType;

  logger.info(`ActivatePayment|${clientId}|${rptId}`);

  // Some static information will be obtained by PagoPAConfig, to identify this client.
  const nodeClientConfig =
    NodeClientEnum.CLIENT_IO === clientId
      ? pagoPAConfig.IDENTIFIERS.CLIENT_IO
      : pagoPAConfig.IDENTIFIERS.CLIENT_CHECKOUT;

  // Convert the input provided by BackendApp (RESTful request)
  // to a PagoPA request (SOAP request), mapping useful information
  // Some static information will be obtained by PagoPAConfig, to identify this client
  // If something wrong into input will be detected during mapping, and error will be provided as response
  const errorOrNodoAttivaRPTInput = PaymentsConverter.getNodoAttivaRPTInput(
    nodeClientConfig,
    params.body
  );
  if (E.isLeft(errorOrNodoAttivaRPTInput)) {
    const error = errorOrNodoAttivaRPTInput.left;

    const errorDetail = `ActivatePayment|Invalid request|${error}`;

    logger.error(errorDetail);

    trackPaymentEvent({
      name: EventNameEnum.PAYMENT_ACTIVATION,
      properties: {
        codiceContestoPagamento: ccp,
        detail: errorDetail,
        result: EventResultEnum.INVALID_INPUT,
        rptId
      }
    });

    return ResponseErrorValidation(
      "Invalid PagoPA activation Request",
      error.message
    );
  }
  const nodoAttivaRPTInput = errorOrNodoAttivaRPTInput.right;

  // Send the SOAP request to PagoPA (AttivaRPT message)
  const errorOrInodoAttivaRPTOutput = await PaymentsService.sendNodoAttivaRPTInputToPagoPa(
    nodoAttivaRPTInput,
    pagoPAClient
  );
  if (E.isLeft(errorOrInodoAttivaRPTOutput)) {
    const error = errorOrInodoAttivaRPTOutput.left;

    const errorDetail = `ActivatePayment|${clientId}|${rptId}|Cannot decode response from pagopa|${error}`;

    logger.error(errorDetail);

    trackPaymentEvent({
      name: EventNameEnum.PAYMENT_ACTIVATION,
      properties: {
        clientId,
        codiceContestoPagamento: ccp,
        detail: errorDetail,
        result: EventResultEnum.ERROR_NODE,
        rptId
      }
    });

    if (error.message === "ESOCKETTIMEDOUT") {
      return ResponseGatewayTimeout();
    } else {
      return ResponsePaymentError(
        FaultCategoryEnum.GENERIC_ERROR,
        PaymentFaultEnum.GENERIC_ERROR,
        GatewayFaultEnum.GENERIC_ERROR
      );
    }
  }
  const iNodoAttivaRPTOutput = errorOrInodoAttivaRPTOutput.right;

  // Check PagoPA response content
  if (iNodoAttivaRPTOutput.esito !== "OK") {
    // If it contains a functional error, an HTTP error will be provided to BackendApp
    const responseError = getResponseErrorIfExists(iNodoAttivaRPTOutput.fault);

    if (
      responseError === undefined ||
      iNodoAttivaRPTOutput.fault === undefined
    ) {
      const errorDetail = `GetPaymentInfo|Error during payment check: esito === KO|${clientId}|${rptId}|${responseError}|${JSON.stringify(
        iNodoAttivaRPTOutput.fault
      )}`;

      logger.error(errorDetail);

      trackPaymentEvent({
        name: EventNameEnum.PAYMENT_ACTIVATION,
        properties: {
          clientId,
          codiceContestoPagamento: ccp,
          detail: errorDetail,
          result: EventResultEnum.ERROR_NODE,
          rptId
        }
      });
      return ResponsePaymentError(
        FaultCategoryEnum.GENERIC_ERROR,
        PaymentFaultEnum.GENERIC_ERROR,
        GatewayFaultEnum.GENERIC_ERROR
      );
    }

    if (
      responseError.detail.toString() !==
      PaymentFaultEnum.PPT_MULTI_BENEFICIARIO
    ) {
      logger.error(
        `ActivatePayment|Error from pagopa|${clientId}|${rptId}|${
          responseError.detail
        }|${JSON.stringify(iNodoAttivaRPTOutput.fault)}`
      );

      const detailV2 = getDetailV2FromFaultCode(iNodoAttivaRPTOutput.fault);

      const errorDetail = `ActivatePayment|ResponseError (detail: ${responseError.detail} - detail_v2: ${detailV2})`;
      logger.error(errorDetail);

      trackPaymentEvent({
        name: EventNameEnum.PAYMENT_ACTIVATION,
        properties: {
          clientId,
          codiceContestoPagamento: ccp,
          detail: errorDetail,
          detail_v2: detailV2,
          result: EventResultEnum.ERROR_NODE,
          rptId
        }
      });
      return responseFromPaymentFault(responseError, detailV2);
    } else {
      /**
       * Handler of Nuovo Modello 3 (nm3 - PPT_MULTI_BENEFICIARIO)
       */

      const generalRptId: GeneralRptId = {
        asObject: rptIdObject,
        asString: rptId
      };

      return await nodoActivateIOPaymentService(
        clientId,
        pagoPAConfig,
        pagoPAClientNm3,
        redisClient,
        redisTimeoutSecs,
        ccp,
        generalRptId,
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

  if (E.isLeft(responseOrError)) {
    const errorDetail = `ActivatePayment|${clientId}|${rptId}|Cannot construct valid response|${PathReporter.report(
      responseOrError
    )}`;

    logger.error(errorDetail);

    trackPaymentEvent({
      name: EventNameEnum.PAYMENT_ACTIVATION,
      properties: {
        clientId,
        codiceContestoPagamento: ccp,
        detail: errorDetail,
        result: EventResultEnum.ERROR_NODE,
        rptId
      }
    });

    return ResponseErrorFromValidationErrors(PaymentActivationsPostResponse)(
      responseOrError.left
    );
  }

  trackPaymentEvent({
    name: EventNameEnum.PAYMENT_ACTIVATION,
    properties: {
      clientId,
      codiceContestoPagamento: ccp,
      result: EventResultEnum.OK,
      rptId
    }
  });
  return ResponseSuccessJson(responseOrError.right);
};

/**
 * This controller will be invoked by BackendApp.
 * It's necessary to start the payment process for a specific payment.
 * It will require the payment lock to PagoPA (AttivaRPT service) to avoid concurrency problems.
 * This request result will confirm the taking charge about the payment lock request.
 * If success, it will be necessary to wait an async response from PagoPA.
 *
 * @param {express.Request} req - The RESTful request
 * @param {PagoPAConfig} pagoPAConfig - Configuration about PagoPA WS to contact
 * @return {Promise<PaymentCtrlResponse<PaymentActivationsPostRequest>>} The response content to send to applicant
 */
export function activatePayment(
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
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  return async req => {
    // Validate input provided by BackendAp
    const errorOrPaymentActivationsPostRequest = PaymentActivationsPostRequest.decode(
      req.body
    );
    if (E.isLeft(errorOrPaymentActivationsPostRequest)) {
      const error = errorOrPaymentActivationsPostRequest.left;
      return ResponseErrorFromValidationErrors(PaymentActivationsPostRequest)(
        error
      );
    }
    const paymentActivationsPostRequest =
      errorOrPaymentActivationsPostRequest.right;

    const clientId = getClientId(req);

    type HandlerReturnType = Promise<
      AsControllerResponseType<TypeofApiResponse<ActivatePaymentT>>
    >;
    const responseHandler: (id: string) => HandlerReturnType = id =>
      controller({
        body: paymentActivationsPostRequest,
        "x-Client-Id": id
      });

    return pipe(
      clientId,
      E.fold(headerValidationErrorHandler, responseHandler)
    );
  };
}

/**
 * This controller is invoked by PagoPA that provides a paymentId
 * related to a previous async request (attivaRPT)
 * It just store this information into redis db. This information will be retrieved by App using polling
 *
 * @param {cdInfoWisp_element_ppt} cdInfoWisp_element_ppt - The request from PagoPA
 * @param {number} redisTimeoutSecs - The expiration timeout for the information to store
 * @param {RedisClient} redisClient - The redis client used to store the paymentId
 * @return {Promise<IResponse*>} The response content to send to applicant
 */
export async function setActivationStatus(
  cdInfoWispInput: cdInfoWisp_element_ppt,
  redisTimeoutSecs: number,
  redisClient: redis.RedisClient
): Promise<cdInfoWispResponse_element_ppt> {
  return pipe(
    await redisSet(
      redisClient,
      cdInfoWispInput.codiceContestoPagamento,
      cdInfoWispInput.idPagamento,
      "EX", // Set the specified expire time, in seconds.
      redisTimeoutSecs
    ),
    E.fold(
      _ => ({
        esito: "KO"
      }),
      _ => ({
        esito: "OK"
      })
    )
  );
}

export async function setNm3PaymentOption(
  codiceContestoPagamento: CodiceContestoPagamento,
  idPayment: string,
  redisTimeoutSecs: number,
  redisClient: redis.RedisClient
): Promise<boolean> {
  return pipe(
    await redisSet(
      redisClient,
      codiceContestoPagamento,
      idPayment,
      "EX", // Set the specified expire time, in seconds.
      redisTimeoutSecs
    ),
    E.fold(
      _ => false,
      _ => true
    )
  );
}

// 3. getIdPagamentoCtrl
const getGetActivationStatusController: (
  redisClient: redis.RedisClient
) => AsControllerFunction<
  GetActivationStatusT
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
> = redisClient => async params => {
  // Retrieve idPayment related to a codiceContestoPagamento from DB
  // It's just a key-value mapping

  const maybeIdPaymentOrError = await redisGet(
    redisClient,
    params.codice_contesto_pagamento
  );

  if (E.isLeft(maybeIdPaymentOrError)) {
    return ResponsePaymentError(
      FaultCategoryEnum.GENERIC_ERROR,
      PaymentFaultEnum.GENERIC_ERROR,
      GatewayFaultEnum.GENERIC_ERROR
    );
  }

  const maybeIdPayment = maybeIdPaymentOrError.right;

  if (O.isNone(maybeIdPayment)) {
    return ResponseErrorNotFound("Not found", "getActivationStatus");
  }

  const idPayment = maybeIdPayment.value;

  const responseOrError = PaymentActivationsGetResponse.decode({
    idPagamento: idPayment
  });

  if (E.isLeft(responseOrError)) {
    return ResponseErrorFromValidationErrors(PaymentActivationsGetResponse)(
      responseOrError.left
    );
  }

  return ResponseSuccessJson(responseOrError.right);
};

/**
 * This controller is invoked by BackendApp to check the status of a previous activation request (async process)
 * If PagoPA sent an activation result (via cdInfoWisp), a paymentId will be retrieved into redis
 * The paymentId is necessary for App to proceed with the payment process
 *
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
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  return async req => {
    // Validate codiceContestoPagamento (transaction id) data provided by BackendApp
    const errorOrCodiceContestoPagamento = CodiceContestoPagamento.decode(
      req.params.codiceContestoPagamento
    );
    if (E.isLeft(errorOrCodiceContestoPagamento)) {
      const error = errorOrCodiceContestoPagamento.left;
      return ResponseErrorFromValidationErrors(CodiceContestoPagamento)(error);
    }
    const codiceContestoPagamento = errorOrCodiceContestoPagamento.right;

    const clientId = getClientId(req);

    type HandlerReturnType = Promise<
      AsControllerResponseType<TypeofApiResponse<GetActivationStatusT>>
    >;
    const responseHandler: (id: string) => HandlerReturnType = id =>
      controller({
        codice_contesto_pagamento: codiceContestoPagamento,
        "x-Client-Id": id
      });

    return pipe(
      clientId,
      E.fold(headerValidationErrorHandler, responseHandler)
    );
  };
}

/**
 * Generate a Transaction ID based on uuid (timestamp + random)
 * to follow a stream of requests with PagoPA.
 * It will be generated here after the first interaction
 * started by BackendApp (checkPayment)
 * For the next messages, BackendApp will provide the same codiceContestoPagamento
 *
 * @return {Either<Error,CodiceContestoPagamento>} The generated id or an internal error
 */
function generateCodiceContestoPagamento(): CodiceContestoPagamento {
  return uuid.v1().replace(/-/g, "") as CodiceContestoPagamento;
}

export const PagopaErrorMetadata = t.interface({
  category: FaultCategory,
  detail: PaymentFault
});

export type PagopaErrorMetadata = t.TypeOf<typeof PagopaErrorMetadata>;

/**
 * Parse a PagoPa response to check if it contains functional errors.
 * If error is found, it is mapped into a controller response for BackendApp and an error category for third party clients
 *
 * @param {string} faultBean - Optional information provided by PagoPa in case of error
 * @return {PagopaErrorMetadata | undefined} An error metadata object or undefined if no errors exist
 */
export function getResponseErrorIfExists(
  faultBean: faultBean_type_ppt | undefined
): PagopaErrorMetadata | undefined {
  // Response is FAILED but no additional information are provided by PagoPa
  if (faultBean === undefined) {
    return undefined;
  }
  // Response is FAILED and additional information are provided by PagoPa
  const errorDetail = O.fromNullable(
    getErrorMessageCtrlFromPagoPaError(
      faultBean.faultCode,
      faultBean.description,
      faultBean.originalFaultCode
    )
  );

  const errorCategory = O.fromNullable(
    getFaultCodeCategory(
      faultBean.faultCode,
      faultBean.description,
      faultBean.originalFaultCode
    )
  );

  return pipe(
    O.Do,
    O.bind("detail", () => errorDetail),
    O.bind("category", () => errorCategory),
    O.map(({ detail, category }) => ({
      category,
      detail
    })),
    O.getOrElse<PagopaErrorMetadata | undefined>(() => undefined)
  );
}

/**
 * Convert PagoPa message error (faultCode) to Controller message error (ErrorMessagesCtrlEnum) to send to BackendApp
 * A complete list of faultCode provided by PagoPa is available at
 * https://www.agid.gov.it/sites/default/files/repository_files/specifiche_attuative_nodo_2_1_0.pdf
 *
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
 * Convert PagoPa message error (faultCode) to an error category (FaultCategory) to send to third party clients
 * A complete list of faultCode provided by PagoPa is available at
 * https://www.agid.gov.it/sites/default/files/repository_files/specifiche_attuative_nodo_2_1_0.pdf
 *
 * @param {string} faultCode - Error code provided by PagoPa
 * @return {FaultCategory} Error category to send to third party clients
 */
// eslint-disable-next-line complexity
export function getFaultCodeCategory(
  faultCode: string,
  faultDescription: string | undefined,
  originalFaultCode?: string
): FaultCategory {
  const fallbackUnhandledVariant: (
    fallbackVariant: FaultCategory
  ) => FaultCategory = fallbackVariant => {
    if (originalFaultCode !== undefined) {
      return getFaultCodeCategory(originalFaultCode, undefined);
    }
    if (faultDescription !== undefined) {
      // if there's a description, try to look for a fault code in the
      // description
      const extractedFaultCode = faultDescription.match(/(PAA|PPT)_\S+/);
      if (extractedFaultCode !== null) {
        return getFaultCodeCategory(extractedFaultCode[0], undefined);
      }
    }
    logger.warn(
      `Retrieved a generic PagoPA error response: (FaultCode: ${faultCode} - Description: ${faultDescription})`
    );

    return fallbackVariant;
  };

  switch (faultCode) {
    case "PPT_PSP_SCONOSCIUTO":
    case "PPT_PSP_DISABILITATO":
    case "PPT_INTERMEDIARIO_PSP_SCONOSCIUTO":
    case "PPT_INTERMEDIARIO_PSP_DISABILITATO":
    case "PPT_CANALE_SCONOSCIUTO":
    case "PPT_CANALE_DISABILITATO":
    case "PPT_AUTENTICAZIONE":
    case "PPT_AUTORIZZAZIONE":
    case "PPT_DOMINIO_DISABILITATO":
    case "PPT_INTERMEDIARIO_PA_DISABILITATO":
    case "PPT_STAZIONE_INT_PA_DISABILITATA":
    case "PPT_CODIFICA_PSP_SCONOSCIUTA":
    case "PPT_SEMANTICA":
    case "PPT_SYSTEM_ERROR":
    case "PAA_SEMANTICA":
      return FaultCategoryEnum.PAYMENT_UNAVAILABLE;
    case "PAA_PAGAMENTO_DUPLICATO":
    case "PPT_PAGAMENTO_DUPLICATO":
      return FaultCategoryEnum.PAYMENT_DUPLICATED;
    case "PAA_PAGAMENTO_IN_CORSO":
    case "PPT_PAGAMENTO_IN_CORSO":
      return FaultCategoryEnum.PAYMENT_ONGOING;
    case "PAA_PAGAMENTO_SCADUTO":
      return FaultCategoryEnum.PAYMENT_EXPIRED;
    case "PPT_SINTASSI_EXTRAXSD":
    case "PPT_SINTASSI_XSD":
    case "PPT_DOMINIO_SCONOSCIUTO":
    case "PPT_STAZIONE_INT_PA_SCONOSCIUTA":
    case "PAA_PAGAMENTO_SCONOSCIUTO":
      return FaultCategoryEnum.PAYMENT_UNKNOWN;
    case "PPT_STAZIONE_INT_PA_IRRAGGIUNGIBILE":
    case "PPT_STAZIONE_INT_PA_TIMEOUT":
    case "PPT_STAZIONE_INT_PA_ERRORE_RESPONSE":
    case "PPT_IBAN_NON_CENSITO":
    case "PAA_SINTASSI_EXTRAXSD":
    case "PAA_SINTASSI_XSD":
    case "PAA_ID_DOMINIO_ERRATO":
    case "PAA_ID_INTERMEDIARIO_ERRATO":
    case "PAA_STAZIONE_INT_ERRATA":
    case "PAA_ATTIVA_RPT_IMPORTO_NON_VALIDO":
    case "PAA_SYSTEM_ERROR":
      return FaultCategoryEnum.DOMAIN_UNKNOWN;
    case "PAA_PAGAMENTO_ANNULLATO":
      return FaultCategoryEnum.PAYMENT_CANCELED;
    case "PPT_ERRORE_EMESSO_DA_PAA":
      return fallbackUnhandledVariant(FaultCategoryEnum.DOMAIN_UNKNOWN);
    default:
      return fallbackUnhandledVariant(FaultCategoryEnum.GENERIC_ERROR);
  }
}

/**
 * Retrive detail_v2 from PagoPa message error (faultCode)
 *
 * @param {string} faultCode - Error code provided by PagoPa
 * @return {detail_v2} detail_v2 to send to BackendApp
 */
export function getDetailV2FromFaultCode(
  fault: faultBean_type_ppt,
  isNM3Enabled: boolean = true
): PaymentFaultV2Enum {
  const maybeOriginalFaultCode = PaymentFaultV2.decode(fault.originalFaultCode);
  const maybeFaultCode = PaymentFaultV2.decode(fault.faultCode);
  const extractedValues = fault.faultString.match(/(PAA|PPT)_\S+/);
  const maybeExtractedFaultCode =
    extractedValues != null
      ? PaymentFaultV2.decode(extractedValues[0])
      : undefined;
  const detailV2 = E.isRight(maybeOriginalFaultCode)
    ? maybeOriginalFaultCode.right
    : maybeExtractedFaultCode && E.isRight(maybeExtractedFaultCode)
    ? maybeExtractedFaultCode.right
    : E.isRight(maybeFaultCode)
    ? maybeFaultCode.right
    : PaymentFaultV2Enum.GENERIC_ERROR;

  // feature flag NM3 - PPR-162
  const detailV2Nm3Disabled =
    detailV2.toString() === "PPT_PAGAMENTO_IN_CORSO"
      ? PaymentFaultV2Enum.PAA_PAGAMENTO_IN_CORSO
      : detailV2.toString() === "PPT_PAGAMENTO_DUPLICATO"
      ? PaymentFaultV2Enum.PAA_PAGAMENTO_DUPLICATO
      : detailV2;

  return isNM3Enabled ? detailV2 : detailV2Nm3Disabled;
}
