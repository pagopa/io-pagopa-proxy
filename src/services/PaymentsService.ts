/* eslint-disable prefer-arrow/prefer-arrow-functions */
/**
 * PaymentsService
 * Provide services related to Payments (Nodo) to communicate with PagoPA and Backend API
 */

import { Either, left, right } from "fp-ts/lib/Either";
import { esitoNodoAttivaRPTRisposta_type_ppt } from "../../generated/PagamentiTelematiciPspNodoservice/esitoNodoAttivaRPTRisposta_type_ppt";
import { esitoNodoVerificaRPTRisposta_type_ppt } from "../../generated/PagamentiTelematiciPspNodoservice/esitoNodoVerificaRPTRisposta_type_ppt";
import { nodoAttivaRPT_element_ppt } from "../../generated/PagamentiTelematiciPspNodoservice/nodoAttivaRPT_element_ppt";
import { nodoVerificaRPT_element_ppt } from "../../generated/PagamentiTelematiciPspNodoservice/nodoVerificaRPT_element_ppt";
import { logger } from "../utils/Logger";

import { activateIOPaymentReq_element_nfpsp } from "../../generated/nodeNm3io/activateIOPaymentReq_element_nfpsp";
import { activateIOPaymentRes_element_nfpsp } from "../../generated/nodeNm3io/activateIOPaymentRes_element_nfpsp";
import { verifyPaymentNoticeReq_element_nfpsp } from "../../generated/nodeNm3psp/verifyPaymentNoticeReq_element_nfpsp";
import { verifyPaymentNoticeRes_element_nfpsp } from "../../generated/nodeNm3psp/verifyPaymentNoticeRes_element_nfpsp";
import { PagamentiTelematiciPspNodoAsyncClient } from "./pagopa_api/PPTPortClient";
import { PagamentiTelematiciPspNm3NodoAsyncClient } from "./pagopa_api/NodoNM3PortClient";

/**
 * Send a request to PagoPA to retrieve payment info (VerificaRPT)
 *
 * @param {nodoVerificaRPT_element_ppt} nodoVerificaRPTInput - The request to send to PagoPA
 * @param {PagamentiTelematiciPspNodoAsyncClient} pagoPASoapClient - SOAP client used to call PagoPa services
 * @return {Promise<Either<Error, esitoNodoVerificaRPTRisposta_type_ppt>>} The response provided by PagoPA as response
 */
export async function sendNodoVerificaRPTInput(
  nodoVerificaRPTInput: nodoVerificaRPT_element_ppt,
  pagoPASoapClient: PagamentiTelematiciPspNodoAsyncClient
): Promise<Either<Error, esitoNodoVerificaRPTRisposta_type_ppt>> {
  try {
    const nodoVerificaRPT = await pagoPASoapClient.nodoVerificaRPT(
      nodoVerificaRPTInput
    );
    return right(nodoVerificaRPT.nodoVerificaRPTRisposta);
  } catch (exception) {
    logger.error(
      `Exception catched sending VerificaRPTRequest to PagoPA: ${exception.message}|${exception.response}|${exception.body}`
    );
    return left(exception);
  }
}

export async function sendNodoVerifyPaymentNoticeInput(
  verifyPaymentNoticeInput: verifyPaymentNoticeReq_element_nfpsp,
  pagoPASoapClient: PagamentiTelematiciPspNm3NodoAsyncClient
): Promise<Either<Error, verifyPaymentNoticeRes_element_nfpsp>> {
  try {
    const verifyPaymentNoticeR = await pagoPASoapClient.verifyPaymentNotice(
      verifyPaymentNoticeInput
    );
    return right(verifyPaymentNoticeR);
  } catch (exception) {
    logger.error(
      `Exception catched sending verifyPaymentNoticeRequest to PagoPA: ${exception.message}|${exception.response}|${exception.body}`
    );
    return left(exception);
  }
}

export async function sendNodoActivateIOPaymentInput(
  activateIOPaymentReq: activateIOPaymentReq_element_nfpsp,
  pagoPASoapClient: PagamentiTelematiciPspNm3NodoAsyncClient
): Promise<Either<Error, activateIOPaymentRes_element_nfpsp>> {
  try {
    const activateIOPaymentRes = await pagoPASoapClient.activateIOPayment(
      activateIOPaymentReq
    );
    return right(activateIOPaymentRes);
  } catch (exception) {
    logger.error(
      `Exception catched sending activateIOPaymentReq to PagoPA: ${exception.message}|${exception.response}|${exception.body}`
    );
    return left(exception);
  }
}
/**
 * Send a request to PagoPA to activate (lock) a payment (AttivaRPT)
 *
 * @param {nodoAttivaRPT_element_ppt} nodoAttivaRPTInput - The request to send to PagoPA
 * @param {pagamentiTelematiciPSPNodoClient} pagoPASoapClient - SOAP client used to call PagoPa services
 * @return {Promise<Either<Error, esitoNodoAttivaRPTRisposta_type_ppt>>} The response provided by PagoPA as response
 */
export async function sendNodoAttivaRPTInputToPagoPa(
  nodoAttivaRPTInput: nodoAttivaRPT_element_ppt,
  pagoPASoapClient: PagamentiTelematiciPspNodoAsyncClient
): Promise<Either<Error, esitoNodoAttivaRPTRisposta_type_ppt>> {
  try {
    const nodoAttivaRPT = await pagoPASoapClient.nodoAttivaRPT(
      nodoAttivaRPTInput
    );
    return right(nodoAttivaRPT.nodoAttivaRPTRisposta);
  } catch (exception) {
    logger.error(
      `Exception catched sending AttivaRPTRequest to PagoPA: ${exception.message}|${exception.response}|${exception.body}`
    );
    return left(exception);
  }
}
