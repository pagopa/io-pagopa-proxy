import { isLeft } from "fp-ts/lib/Either";
import { PathReporter } from "io-ts/lib/PathReporter";
import {
  IResponseErrorInternal,
  IResponseErrorValidation,
  IResponseSuccessJson,
  ResponseErrorFromValidationErrors,
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

import { ImportoEuroCents } from "../../generated/api/ImportoEuroCents";
import { PaymentActivationsPostResponse } from "../../generated/api/PaymentActivationsPostResponse";
import { PaymentFaultV2Enum } from "../../generated/api/PaymentFaultV2";
import {
  EventNameEnum,
  EventResultEnum,
  trackPaymentEvent
} from "../utils/AIUtils";
import { GeneralRptId, ResponsePaymentError } from "../utils/types";
import * as PaymentsService from "./PaymentsService";

/**
 * The goal of this function is to call verifyPaymentNotice service of pagoPA Node
 */
export async function nodoVerifyPaymentNoticeService(
  pagoPAConfig: PagoPAConfig,
  pagoPAClientNm3: PagamentiTelematiciPspNm3NodoAsyncClient,
  rptId: GeneralRptId,
  codiceContestoPagamento: CodiceContestoPagamento
): Promise<
  | IResponseErrorValidation
  | IResponseErrorInternal
  | IResponseSuccessJson<PaymentRequestsGetResponse>
> {
  logger.info(`GetNodoVerifyPaymentNotice|(nm3) for request|${rptId.asString}`);

  const errorOrIverifyPaymentNoticeutput = PaymentsConverter.getNodoVerifyPaymentNoticeInput(
    pagoPAConfig,
    rptId.asObject
  );

  if (isLeft(errorOrIverifyPaymentNoticeutput)) {
    const error = errorOrIverifyPaymentNoticeutput.value;

    const errorDetail = `GetNodoVerifyPaymentNotice| Cannot construct request|${
      rptId.asString
    }|${error.message}`;
    logger.error(errorDetail);

    trackPaymentEvent({
      name: EventNameEnum.PAYMENT_VERIFY,
      properties: {
        rptId: rptId.asString,
        codiceContestoPagamento,
        result: EventResultEnum.INVALID_INPUT,
        detail: errorDetail
      }
    });
    return ResponseErrorValidation("Invalid PagoPA check", error.message);
  }

  const iverifyPaymentNoticeInput = errorOrIverifyPaymentNoticeutput.value;

  // Send the SOAP request to PagoPA (sendNodoVerifyPaymentNotice message)
  logger.info(
    `GetNodoVerifyPaymentNotice| sendNodoVerifyPaymentNotice for request | ${
      rptId.asString
    }`
  );

  const errorOrIverifyPaymentNoticeOutput = await PaymentsService.sendNodoVerifyPaymentNoticeInput(
    iverifyPaymentNoticeInput,
    pagoPAClientNm3
  );

  if (isLeft(errorOrIverifyPaymentNoticeOutput)) {
    const error = errorOrIverifyPaymentNoticeOutput.value;
    const errorDetail = `GetNodoVerifyPaymentNotice| Error while calling pagopa | ${
      rptId.asString
    }|${error.message}`;

    logger.error(errorDetail);

    trackPaymentEvent({
      name: EventNameEnum.PAYMENT_VERIFY,
      properties: {
        rptId: rptId.asString,
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
      const errorDetail =
        "Error during GetNodoVerifyPaymentNotice check: esito === KO";

      logger.error(errorDetail);

      trackPaymentEvent({
        name: EventNameEnum.PAYMENT_VERIFY,
        properties: {
          rptId: rptId.asString,
          codiceContestoPagamento,
          result: EventResultEnum.ERROR_NODE,
          detail: errorDetail
        }
      });

      return ResponsePaymentError(
        PaymentFaultEnum.GENERIC_ERROR,
        PaymentFaultV2Enum.GENERIC_ERROR
      );
    }

    const detailV2 = getDetailV2FromFaultCode(iverifyPaymentNoticeOutput.fault);

    const detailError = `GetNodoVerifyPaymentNotice|ResponsePaymentError (detail: ${responseErrorVerifyPaymentNotice} - detail_v2: ${detailV2})`;

    logger.warn(detailError);

    trackPaymentEvent({
      name: EventNameEnum.PAYMENT_VERIFY,
      properties: {
        rptId: rptId.asString,
        codiceContestoPagamento,
        result: EventResultEnum.ERROR_NODE,
        detail: detailError,
        detail_v2: detailV2
      }
    });

    return ResponsePaymentError(responseErrorVerifyPaymentNotice, detailV2);
  } else {
    const responseOrErrorNm3 = PaymentsConverter.getPaymentRequestsGetResponseNm3(
      iverifyPaymentNoticeOutput,
      codiceContestoPagamento
    );

    if (isLeft(responseOrErrorNm3)) {
      const detailError = `GetNodoVerifyPaymentNotice| Cannot construct valid response|${
        rptId.asString
      }|${PathReporter.report(responseOrErrorNm3)}`;
      logger.error(detailError);

      trackPaymentEvent({
        name: EventNameEnum.PAYMENT_VERIFY,
        properties: {
          rptId: rptId.asString,
          codiceContestoPagamento,
          result: EventResultEnum.ERROR_NODE,
          detail: detailError
        }
      });
      return ResponseErrorFromValidationErrors(PaymentRequestsGetResponse)(
        responseOrErrorNm3.value
      );
    }
    trackPaymentEvent({
      name: EventNameEnum.PAYMENT_VERIFY,
      properties: {
        rptId: rptId.asString,
        codiceContestoPagamento,
        result: EventResultEnum.OK
      }
    });
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
  rptId: GeneralRptId,
  amount: ImportoEuroCents
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
    rptId.asObject,
    amount
  );

  if (isLeft(errorOrActivateIOPaymentInput)) {
    const error = errorOrActivateIOPaymentInput.value;

    const errorDetail = `ActivateIOPayment|Cannot construct request|${codiceContestoPagamento}|${
      error.message
    }`;

    logger.error(errorDetail);

    trackPaymentEvent({
      name: EventNameEnum.PAYMENT_ACTIVATION,
      properties: {
        rptId: rptId.asString,
        codiceContestoPagamento,
        result: EventResultEnum.ERROR_NODE,
        detail: errorDetail
      }
    });
    return ResponseErrorValidation(
      "ActivateIOPayment|Invalid PagoPA check ActivateIOPayment",
      error.message
    );
  }

  const activateIOPaymentInput = errorOrActivateIOPaymentInput.value;

  // Send the SOAP request to PagoPA (sendNodoAcitvatePaymentNotice message)
  logger.info(
    `ActivateIOPayment|sendNodoAcitvatePaymentNoticeInput for request | ${codiceContestoPagamento}`
  );

  const errorOrActivateIOPaymentOutput = await PaymentsService.sendNodoActivateIOPaymentInput(
    activateIOPaymentInput,
    pagoPAClientNm3
  );

  if (isLeft(errorOrActivateIOPaymentOutput)) {
    const error = errorOrActivateIOPaymentOutput.value;

    const errorDetail = `ActivateIOPayment|Error while calling pagopa | ${codiceContestoPagamento}|${
      error.message
    }`;

    logger.error(errorDetail);

    trackPaymentEvent({
      name: EventNameEnum.PAYMENT_ACTIVATION,
      properties: {
        rptId: rptId.asString,
        codiceContestoPagamento,
        result: EventResultEnum.ERROR_NODE,
        detail: errorDetail
      }
    });
    return ResponsePaymentError(
      PaymentFaultEnum.GENERIC_ERROR,
      PaymentFaultV2Enum.GENERIC_ERROR
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
      const detailError = "Error during ActivateIOPayment check: esito === KO";

      logger.error(detailError);

      trackPaymentEvent({
        name: EventNameEnum.PAYMENT_ACTIVATION,
        properties: {
          rptId: rptId.asString,
          codiceContestoPagamento,
          result: EventResultEnum.ERROR_NODE,
          detail: detailError
        }
      });
      return ResponsePaymentError(
        PaymentFaultEnum.GENERIC_ERROR,
        PaymentFaultV2Enum.GENERIC_ERROR
      );
    }

    const detailV2 = getDetailV2FromFaultCode(activateIOPaymentOutput.fault);

    const errorDetail = `GetNodoAcitvatePaymentNotice|ResponsePaymentError (detail: ${responseErrorActivateIOPayment} - detail_v2: ${detailV2})`;

    logger.warn(errorDetail);

    trackPaymentEvent({
      name: EventNameEnum.PAYMENT_ACTIVATION,
      properties: {
        rptId: rptId.asString,
        codiceContestoPagamento,
        result: EventResultEnum.ERROR_NODE,
        detail: errorDetail,
        detail_v2: detailV2
      }
    });
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
        const errorDetail = `ActivateIOPayment|Cannot construct valid response|${codiceContestoPagamento}|${PathReporter.report(
          responseOrErrorNm3
        )}`;

        logger.error(errorDetail);

        trackPaymentEvent({
          name: EventNameEnum.PAYMENT_ACTIVATION,
          properties: {
            rptId: rptId.asString,
            codiceContestoPagamento,
            result: EventResultEnum.ERROR_NODE,
            detail: errorDetail
          }
        });
        return ResponseErrorFromValidationErrors(PaymentRequestsGetResponse)(
          responseOrErrorNm3.value
        );
      }

      trackPaymentEvent({
        name: EventNameEnum.PAYMENT_ACTIVATION,
        properties: {
          rptId: rptId.asString,
          codiceContestoPagamento,
          result: EventResultEnum.OK
        }
      });
      return ResponseSuccessJson(responseOrErrorNm3.value);
    } else {
      const errorDetail = "ActivateIOPayment| isIdPaymentSaved fails";

      logger.error(errorDetail);

      trackPaymentEvent({
        name: EventNameEnum.PAYMENT_ACTIVATION,
        properties: {
          rptId: rptId.asString,
          codiceContestoPagamento,
          result: EventResultEnum.ERROR_NODE,
          detail: errorDetail
        }
      });
      return ResponsePaymentError(
        PaymentFaultEnum.GENERIC_ERROR,
        PaymentFaultV2Enum.GENERIC_ERROR
      );
    }
  }
}
