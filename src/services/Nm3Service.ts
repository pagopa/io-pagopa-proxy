import { isLeft } from "fp-ts/lib/Either";
import { PathReporter } from "io-ts/lib/PathReporter";
import { RptId } from "italia-pagopa-commons/lib/pagopa";
import {
  IResponseErrorInternal,
  IResponseErrorValidation,
  IResponseSuccessJson,
  ResponseErrorFromValidationErrors,
  ResponseErrorInternal,
  ResponseErrorValidation,
  ResponseSuccessJson
} from "italia-ts-commons/lib/responses";
import * as redis from "redis";
import { CodiceContestoPagamento } from "../../generated/api/CodiceContestoPagamento";
import { PaymentFaultEnum } from "../../generated/api/PaymentFault";
import { PaymentRequestsGetResponse } from "../../generated/api/PaymentRequestsGetResponse";
import { PagoPAConfig } from "../Configuration";
import {
  getDetailV2FromFaultCode,
  getResponseErrorIfExists,
  setNm3PaymentOption
} from "../controllers/restful/PaymentController";
import { logger } from "../utils/Logger";
import { PagamentiTelematiciPspNm3NodoAsyncClient } from "./pagopa_api/NodoNM3PortClient";

import * as PaymentsConverter from "../utils/PaymentsConverter";

import { PaymentActivationsPostResponse } from "../../generated/api/PaymentActivationsPostResponse";
import { ResponsePaymentError } from "../utils/types";
import * as PaymentsService from "./PaymentsService";

/**
 * The goal of this function is to call verifyPaymentNotice service of pagoPA Node
 */
export async function nodoVerifyPaymentNoticeService(
  pagoPAConfig: PagoPAConfig,
  pagoPAClientNm3: PagamentiTelematiciPspNm3NodoAsyncClient,
  rptIdAsString: string,
  rptId: RptId,
  codiceContestoPagamento: CodiceContestoPagamento
): Promise<
  | IResponseErrorValidation
  | IResponseErrorInternal
  | IResponseSuccessJson<PaymentRequestsGetResponse>
> {
  logger.info(`GetNodoVerifyPaymentNotice|(nm3) for request|${rptIdAsString}`);

  const errorOrIverifyPaymentNoticeutput = PaymentsConverter.getNodoVerifyPaymentNoticeInput(
    pagoPAConfig,
    rptId
  );

  if (isLeft(errorOrIverifyPaymentNoticeutput)) {
    const error = errorOrIverifyPaymentNoticeutput.value;
    logger.error(
      `GetNodoVerifyPaymentNotice| Cannot construct request|${rptIdAsString}|${
        error.message
      }`
    );
    return ResponseErrorValidation("Invalid PagoPA check", error.message);
  }

  const iverifyPaymentNoticeInput = errorOrIverifyPaymentNoticeutput.value;

  // Send the SOAP request to PagoPA (sendNodoVerifyPaymentNotice message)
  logger.info(
    `GetNodoVerifyPaymentNotice| sendNodoVerifyPaymentNotice for request | ${rptIdAsString}`
  );

  const errorOrIverifyPaymentNoticeOutput = await PaymentsService.sendNodoVerifyPaymentNoticeInput(
    iverifyPaymentNoticeInput,
    pagoPAClientNm3
  );

  if (isLeft(errorOrIverifyPaymentNoticeOutput)) {
    const error = errorOrIverifyPaymentNoticeOutput.value;
    logger.error(
      `GetNodoVerifyPaymentNotice| Error while calling pagopa | ${rptIdAsString}|${
        error.message
      }`
    );
    return ResponseErrorInternal(
      `PagoPA Server communication error: ${error.message}`
    );
  }

  const iverifyPaymentNoticeOutput = errorOrIverifyPaymentNoticeOutput.value;

  // Check PagoPA response content
  if (iverifyPaymentNoticeOutput.outcome !== "OK") {
    const responseErrorVerifyPaymentNotice = getResponseErrorIfExists(
      iverifyPaymentNoticeOutput.fault
    );

    if (
      responseErrorVerifyPaymentNotice === undefined ||
      iverifyPaymentNoticeOutput.fault === undefined
    ) {
      return ResponseErrorInternal(
        "Error during GetNodoVerifyPaymentNotice check: esito === KO"
      );
    }

    const detailV2 = getDetailV2FromFaultCode(iverifyPaymentNoticeOutput.fault);
    logger.warn(
      `GetNodoVerifyPaymentNotice|ResponsePaymentError (detail: ${responseErrorVerifyPaymentNotice} - detail_v2: ${detailV2})`
    );
    return ResponsePaymentError(responseErrorVerifyPaymentNotice, detailV2);
  } else {
    const responseOrErrorNm3 = PaymentsConverter.getPaymentRequestsGetResponseNm3(
      iverifyPaymentNoticeOutput,
      codiceContestoPagamento
    );

    if (isLeft(responseOrErrorNm3)) {
      logger.error(
        `GetNodoVerifyPaymentNotice| Cannot construct valid response|${rptIdAsString}|${PathReporter.report(
          responseOrErrorNm3
        )}`
      );
      return ResponseErrorFromValidationErrors(PaymentRequestsGetResponse)(
        responseOrErrorNm3.value
      );
    }
    return ResponseSuccessJson(responseOrErrorNm3.value);
  }
}

/**
 * The goal of this function is to:
 * 1. call ActivateIOPayment service of pagoPA Node
 * 2. save an entry on redis (<cpp,idPayment>), where idPayment is returned from ActivateIOPayment service, according to nm3
 */
export async function nodoActivateIOPaymentService(
  pagoPAConfig: PagoPAConfig,
  pagoPAClientNm3: PagamentiTelematiciPspNm3NodoAsyncClient,
  redisClient: redis.RedisClient,
  redisTimeoutSecs: number,
  codiceContestoPagamento: CodiceContestoPagamento,
  rptId: RptId,
  amount: number
): Promise<
  | IResponseErrorValidation
  | IResponseErrorInternal
  | IResponseSuccessJson<PaymentActivationsPostResponse>
> {
  logger.info(
    `ActivateIOPayment|(nm3) for codiceContestoPagamento ${codiceContestoPagamento}`
  );

  const errorOrActivateIOPaymentInput = PaymentsConverter.getNodoActivateIOPaymentInput(
    pagoPAConfig,
    rptId,
    amount
  );

  if (isLeft(errorOrActivateIOPaymentInput)) {
    const error = errorOrActivateIOPaymentInput.value;
    logger.error(
      `ActivateIOPayment|Cannot construct request|${codiceContestoPagamento}|${
        error.message
      }`
    );
    return ResponseErrorValidation(
      "ActivateIOPayment|Invalid PagoPA check ActivateIOPayment",
      error.message
    );
  }

  const activateIOPaymentInput = errorOrActivateIOPaymentInput.value;

  // Send the SOAP request to PagoPA (sendNodoVerifyPaymentNotice message)
  logger.info(
    `ActivateIOPayment|sendNodoVerifyPaymentNoticeInput for request | ${codiceContestoPagamento}`
  );

  const errorOrActivateIOPaymentOutput = await PaymentsService.sendNodoActivateIOPaymentInput(
    activateIOPaymentInput,
    pagoPAClientNm3
  );

  if (isLeft(errorOrActivateIOPaymentOutput)) {
    const error = errorOrActivateIOPaymentOutput.value;
    logger.error(
      `ActivateIOPayment|Error while calling pagopa | ${codiceContestoPagamento}|${
        error.message
      }`
    );
    return ResponseErrorInternal(
      `PagoPA Server communication error: ${error.message}`
    );
  }

  const activateIOPaymentOutput = errorOrActivateIOPaymentOutput.value;

  // Check PagoPA response content
  if (
    activateIOPaymentOutput.outcome !== "OK" ||
    !activateIOPaymentOutput.paymentToken
  ) {
    const responseErrorActivateIOPayment = getResponseErrorIfExists(
      activateIOPaymentOutput.fault
    );

    if (
      responseErrorActivateIOPayment === undefined ||
      activateIOPaymentOutput.fault === undefined
    ) {
      return ResponseErrorInternal(
        "Error during ActivateIOPayment check: esito === KO"
      );
    }

    const detailV2 = getDetailV2FromFaultCode(activateIOPaymentOutput.fault);
    logger.warn(
      `GetNodoVerifyPaymentNotice|ResponsePaymentError (detail: ${responseErrorActivateIOPayment} - detail_v2: ${detailV2})`
    );
    return ResponsePaymentError(responseErrorActivateIOPayment, detailV2);
  } else {
    const isIdPaymentSaved: boolean = await setNm3PaymentOption(
      codiceContestoPagamento,
      activateIOPaymentOutput.paymentToken,
      redisTimeoutSecs,
      redisClient
    );

    if (isIdPaymentSaved === true) {
      logger.debug(
        `ActivateIOPayment | nm3 isIdPaymentSaved | ${isIdPaymentSaved}`
      );

      const responseOrErrorNm3 = PaymentsConverter.getActivateIOPaymentResponse(
        activateIOPaymentOutput
      );

      if (isLeft(responseOrErrorNm3)) {
        logger.error(
          `ActivateIOPayment|Cannot construct valid response|${codiceContestoPagamento}|${PathReporter.report(
            responseOrErrorNm3
          )}`
        );
        return ResponseErrorFromValidationErrors(PaymentRequestsGetResponse)(
          responseOrErrorNm3.value
        );
      }
      return ResponseSuccessJson(responseOrErrorNm3.value);
    } else {
      return ResponseErrorInternal(PaymentFaultEnum.PAYMENT_UNAVAILABLE);
    }
  }
}
