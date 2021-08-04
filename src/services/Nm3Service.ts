import { isLeft } from "fp-ts/lib/Either";
import { fromNullable } from "fp-ts/lib/Option";
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
  getResponseErrorIfExists,
  setNm3PaymentOption
} from "../controllers/restful/PaymentController";
import { logger } from "../utils/Logger";
import { PagamentiTelematiciPspNm3NodoAsyncClient } from "./pagopa_api/NodoNM3PortClient";

import * as PaymentsConverter from "../utils/PaymentsConverter";

import { PaymentActivationsPostResponse } from "../../generated/api/PaymentActivationsPostResponse";
import * as PaymentsService from "./PaymentsService";

/**
 * The goal of this function is to:
 * 1. call verifyPaymentNotice service of pagoPA Node
 * 2. save an entry on redis (<cpp,"">) in order to cache that the rptId related to cpp is nm3
 */
export async function nodoVerifyPaymentNoticeService(
  pagoPAConfig: PagoPAConfig,
  pagoPAClientNm3: PagamentiTelematiciPspNm3NodoAsyncClient,
  redisClient: redis.RedisClient,
  redisTimeoutSecs: number,
  rptIdAsString: string,
  rptId: RptId,
  codiceContestoPagamento: CodiceContestoPagamento
): Promise<
  | IResponseErrorValidation
  | IResponseErrorInternal
  | IResponseSuccessJson<PaymentRequestsGetResponse>
> {
  logger.info(`GetNodoVerifyPaymentNotice| (nm3) for request|${rptIdAsString}`);

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
    return ResponseErrorValidation(
      "Invalid PagoPA check GetNodoVerifyPaymentNoticeRequest",
      error.message
    );
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

    return ResponseErrorInternal(
      fromNullable(responseErrorVerifyPaymentNotice).getOrElse(
        PaymentFaultEnum.PAYMENT_UNAVAILABLE
      )
    );
  } else {
    const isNm3RedisCached: boolean = await setNm3PaymentOption(
      codiceContestoPagamento,
      "",
      redisTimeoutSecs,
      redisClient
    );

    if (isNm3RedisCached === true) {
      logger.debug(
        `GetNodoVerifyPaymentNotice|·PPT_MULTI_BENEFICIARIO·isNm3Cached | ${isNm3RedisCached}`
      );

      const responseOrErrorNm3 = PaymentsConverter.getPaymentRequestsGetResponseNm3(
        iverifyPaymentNoticeOutput,
        codiceContestoPagamento
      );

      if (isLeft(responseOrErrorNm3)) {
        logger.error(
          `GetPaymentInfo|Cannot construct valid response|${rptIdAsString}|${PathReporter.report(
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
  rptIdAsString: string,
  amount: number
): Promise<
  | IResponseErrorValidation
  | IResponseErrorInternal
  | IResponseSuccessJson<PaymentActivationsPostResponse>
> {
  logger.info(`ActivateIOPayment| (nm3) for rptId|${rptIdAsString}`);

  const errorOrActivateIOPaymentInput = PaymentsConverter.getNodoActivateIOPaymentInput(
    pagoPAConfig,
    rptId,
    amount
  );

  if (isLeft(errorOrActivateIOPaymentInput)) {
    const error = errorOrActivateIOPaymentInput.value;
    logger.error(
      `ActivateIOPayment| Cannot construct request|${rptIdAsString}|${
        error.message
      }`
    );
    return ResponseErrorValidation(
      "Invalid PagoPA check ActivateIOPayment",
      error.message
    );
  }

  const activateIOPaymentInput = errorOrActivateIOPaymentInput.value;

  // Send the SOAP request to PagoPA (sendNodoVerifyPaymentNotice message)
  logger.info(
    `ActivateIOPayment| sendNodoVerifyPaymentNoticeInput for request | ${rptIdAsString}`
  );

  const errorOrActivateIOPaymentOutput = await PaymentsService.sendNodoActivateIOPaymentInput(
    activateIOPaymentInput,
    pagoPAClientNm3
  );

  if (isLeft(errorOrActivateIOPaymentOutput)) {
    const error = errorOrActivateIOPaymentOutput.value;
    logger.error(
      `ActivateIOPayment| Error while calling pagopa | ${rptIdAsString}|${
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

    return ResponseErrorInternal(
      fromNullable(responseErrorActivateIOPayment).getOrElse(
        PaymentFaultEnum.PAYMENT_UNAVAILABLE
      )
    );
  } else {
    const isNm3RedisCached: boolean = await setNm3PaymentOption(
      codiceContestoPagamento,
      activateIOPaymentOutput.paymentToken,
      redisTimeoutSecs,
      redisClient
    );

    if (isNm3RedisCached === true) {
      logger.debug(
        `ActivateIOPayment|·PPT_MULTI_BENEFICIARIO·isNm3Cached | ${isNm3RedisCached}`
      );

      const responseOrErrorNm3 = PaymentsConverter.getActivateIOPaymentResponse(
        activateIOPaymentOutput
      );

      if (isLeft(responseOrErrorNm3)) {
        logger.error(
          `ActivateIOPayment|Cannot construct valid response|${rptIdAsString}|${PathReporter.report(
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
