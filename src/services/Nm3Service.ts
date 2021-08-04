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

import * as PaymentsService from "./PaymentsService";

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
