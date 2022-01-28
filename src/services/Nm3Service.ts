/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { isLeft } from "fp-ts/lib/Either";
import { PathReporter } from "io-ts/lib/PathReporter";

import * as redis from "redis";
import {
  IResponseErrorInternal,
  IResponseErrorValidation,
  IResponseSuccessJson,
  ResponseErrorFromValidationErrors,
  ResponseErrorValidation,
  ResponseSuccessJson
} from "@pagopa/ts-commons/lib/responses";
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
import { PagamentiTelematiciPspNm3NodoAsyncClient } from "./pagopa_api/NodoNM3PortClient";
import * as PaymentsService from "./PaymentsService";

/**
 * The goal of this function is to call verifyPaymentNotice service of pagoPA Node
 */
export async function nodoVerifyPaymentNoticeService(
  clientId: string,
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
    clientId,
    pagoPAConfig,
    rptId.asObject
  );

  if (isLeft(errorOrIverifyPaymentNoticeutput)) {
    const error = errorOrIverifyPaymentNoticeutput.left;

    const errorDetail = `GetNodoVerifyPaymentNotice| Cannot construct request|${clientId}|${rptId.asString}|${error.message}`;
    logger.error(errorDetail);

    trackPaymentEvent({
      name: EventNameEnum.PAYMENT_VERIFY,
      properties: {
        clientId,
        codiceContestoPagamento,
        detail: errorDetail,
        result: EventResultEnum.INVALID_INPUT,
        rptId: rptId.asString
      }
    });
    return ResponseErrorValidation("Invalid PagoPA check", error.message);
  }

  const iverifyPaymentNoticeInput = errorOrIverifyPaymentNoticeutput.right;

  // Send the SOAP request to PagoPA (sendNodoVerifyPaymentNotice message)
  logger.info(
    `GetNodoVerifyPaymentNotice| sendNodoVerifyPaymentNotice for request | ${clientId} | ${rptId.asString}`
  );

  const errorOrIverifyPaymentNoticeOutput = await PaymentsService.sendNodoVerifyPaymentNoticeInput(
    iverifyPaymentNoticeInput,
    pagoPAClientNm3
  );

  if (isLeft(errorOrIverifyPaymentNoticeOutput)) {
    const error = errorOrIverifyPaymentNoticeOutput.left;
    const errorDetail = `GetNodoVerifyPaymentNotice| Error while calling pagopa | ${clientId} | ${rptId.asString}|${error.message}`;

    logger.error(errorDetail);

    trackPaymentEvent({
      name: EventNameEnum.PAYMENT_VERIFY,
      properties: {
        clientId,
        codiceContestoPagamento,
        detail: errorDetail,
        result: EventResultEnum.CONNECTION_NODE,
        rptId: rptId.asString
      }
    });
    return ResponsePaymentError(
      PaymentFaultEnum.GENERIC_ERROR,
      PaymentFaultV2Enum.GENERIC_ERROR
    );
  }

  const iverifyPaymentNoticeOutput = errorOrIverifyPaymentNoticeOutput.right;

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
          clientId,
          codiceContestoPagamento,
          detail: errorDetail,
          result: EventResultEnum.ERROR_NODE,
          rptId: rptId.asString
        }
      });

      return ResponsePaymentError(
        PaymentFaultEnum.GENERIC_ERROR,
        PaymentFaultV2Enum.GENERIC_ERROR
      );
    }

    const detailV2 = getDetailV2FromFaultCode(
      iverifyPaymentNoticeOutput.fault,
      pagoPAConfig.NM3_ENABLED
    );

    const detailError = `GetNodoVerifyPaymentNotice|ResponsePaymentError (detail: ${responseErrorVerifyPaymentNotice} - detail_v2: ${detailV2})`;

    logger.warn(detailError);

    trackPaymentEvent({
      name: EventNameEnum.PAYMENT_VERIFY,
      properties: {
        clientId,
        codiceContestoPagamento,
        detail: detailError,
        detail_v2: detailV2,
        rptId: rptId.asString
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
          clientId,
          codiceContestoPagamento,
          detail: detailError,
          result: EventResultEnum.ERROR_NODE,
          rptId: rptId.asString
        }
      });
      return ResponseErrorFromValidationErrors(PaymentRequestsGetResponse)(
        responseOrErrorNm3.left
      );
    }
    trackPaymentEvent({
      name: EventNameEnum.PAYMENT_VERIFY,
      properties: {
        clientId,
        codiceContestoPagamento,
        result: EventResultEnum.OK,
        rptId: rptId.asString
      }
    });
    // feature flag NM3 - PPR-162
    logger.info(
      `GetNodoVerifyPaymentNotice| valid rptId NM3 with feature flag NM3_ENABLED: ${pagoPAConfig.NM3_ENABLED}`
    );
    return pagoPAConfig.NM3_ENABLED === true
      ? ResponseSuccessJson(responseOrErrorNm3.right)
      : ResponsePaymentError(
          PaymentFaultEnum.GENERIC_ERROR,
          PaymentFaultV2Enum.PPT_AUTORIZZAZIONE
        );
  }
}

/**
 * The goal of this function is to:
 * 1. call ActivateIOPayment service of pagoPA Node
 * 2. save an entry on redis (<cpp,idPayment>), where idPayment is returned from ActivateIOPayment service, according to nm3
 */
// eslint-disable-next-line max-params,  max-lines-per-function
export async function nodoActivateIOPaymentService(
  clientId: string,
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
    clientId,
    pagoPAConfig,
    rptId.asObject,
    amount
  );

  if (isLeft(errorOrActivateIOPaymentInput)) {
    const error = errorOrActivateIOPaymentInput.left;

    const errorDetail = `ActivateIOPayment|Cannot construct request|${clientId}|${codiceContestoPagamento}|${error.message}`;

    logger.error(errorDetail);

    trackPaymentEvent({
      name: EventNameEnum.PAYMENT_ACTIVATION,
      properties: {
        clientId,
        codiceContestoPagamento,
        detail: errorDetail,
        result: EventResultEnum.ERROR_NODE,
        rptId: rptId.asString
      }
    });
    return ResponseErrorValidation(
      "ActivateIOPayment|Invalid PagoPA check ActivateIOPayment",
      error.message
    );
  }

  const activateIOPaymentInput = errorOrActivateIOPaymentInput.right;

  // Send the SOAP request to PagoPA (sendNodoAcitvatePaymentNotice message)
  logger.info(
    `ActivateIOPayment|sendNodoActivatePaymentNoticeInput for request | ${clientId} | ${codiceContestoPagamento}`
  );

  const errorOrActivateIOPaymentOutput = await PaymentsService.sendNodoActivateIOPaymentInput(
    activateIOPaymentInput,
    pagoPAClientNm3
  );

  if (isLeft(errorOrActivateIOPaymentOutput)) {
    const error = errorOrActivateIOPaymentOutput.left;

    const errorDetail = `ActivateIOPayment|Error while calling pagopa | ${clientId} |  ${codiceContestoPagamento}|${error.message}`;

    logger.error(errorDetail);

    trackPaymentEvent({
      name: EventNameEnum.PAYMENT_ACTIVATION,
      properties: {
        clientId,
        codiceContestoPagamento,
        detail: errorDetail,
        result: EventResultEnum.ERROR_NODE,
        rptId: rptId.asString
      }
    });
    return ResponsePaymentError(
      PaymentFaultEnum.GENERIC_ERROR,
      PaymentFaultV2Enum.GENERIC_ERROR
    );
  }

  const activateIOPaymentOutput = errorOrActivateIOPaymentOutput.right;

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
          codiceContestoPagamento,
          detail: detailError,
          result: EventResultEnum.ERROR_NODE,
          rptId: rptId.asString
        }
      });
      return ResponsePaymentError(
        PaymentFaultEnum.GENERIC_ERROR,
        PaymentFaultV2Enum.GENERIC_ERROR
      );
    }

    const detailV2 = getDetailV2FromFaultCode(
      activateIOPaymentOutput.fault,
      pagoPAConfig.NM3_ENABLED
    );

    const errorDetail = `GetNodoAcitvatePaymentNotice|ResponsePaymentError (detail: ${responseErrorActivateIOPayment} - detail_v2: ${detailV2})`;

    logger.warn(errorDetail);

    trackPaymentEvent({
      name: EventNameEnum.PAYMENT_ACTIVATION,
      properties: {
        clientId,
        codiceContestoPagamento,
        detail: errorDetail,
        detail_v2: detailV2,
        result: EventResultEnum.ERROR_NODE,
        rptId: rptId.asString
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
        const errorDetail = `ActivateIOPayment|Cannot construct valid response|${clientId}|${codiceContestoPagamento}|${PathReporter.report(
          responseOrErrorNm3
        )}`;

        logger.error(errorDetail);

        trackPaymentEvent({
          name: EventNameEnum.PAYMENT_ACTIVATION,
          properties: {
            clientId,
            codiceContestoPagamento,
            detail: errorDetail,
            result: EventResultEnum.ERROR_NODE,
            rptId: rptId.asString
          }
        });
        return ResponseErrorFromValidationErrors(PaymentRequestsGetResponse)(
          responseOrErrorNm3.left
        );
      }

      trackPaymentEvent({
        name: EventNameEnum.PAYMENT_ACTIVATION,
        properties: {
          clientId,
          codiceContestoPagamento,
          result: EventResultEnum.OK,
          rptId: rptId.asString
        }
      });
      return ResponseSuccessJson(responseOrErrorNm3.right);
    } else {
      const errorDetail = "ActivateIOPayment| isIdPaymentSaved fails";

      logger.error(errorDetail);

      trackPaymentEvent({
        name: EventNameEnum.PAYMENT_ACTIVATION,
        properties: {
          clientId,
          codiceContestoPagamento,
          detail: errorDetail,
          result: EventResultEnum.ERROR_NODE,
          rptId: rptId.asString
        }
      });
      return ResponsePaymentError(
        PaymentFaultEnum.GENERIC_ERROR,
        PaymentFaultV2Enum.GENERIC_ERROR
      );
    }
  }
}
