/**
 * PaymentsService
 * Provide services related to Payments (Nodo) to communicate with PagoPA and Backend API
 */

import { Either, left, right } from "fp-ts/lib/Either";
import { esitoNodoAttivaRPTRisposta_ppt } from "../types/pagopa_api/yaml-to-ts/esitoNodoAttivaRPTRisposta_ppt";
import { esitoNodoVerificaRPTRisposta_ppt } from "../types/pagopa_api/yaml-to-ts/esitoNodoVerificaRPTRisposta_ppt";
import { nodoAttivaRPT_ppt } from "../types/pagopa_api/yaml-to-ts/nodoAttivaRPT_ppt";
import { nodoVerificaRPT_ppt } from "../types/pagopa_api/yaml-to-ts/nodoVerificaRPT_ppt";
import { PagamentiTelematiciPspNodoAsyncClient } from "./pagopa_api/PPTPortClient";

/**
 * Send a request to PagoPA to retrieve payment info (VerificaRPT)
 * @param {nodoVerificaRPT_ppt} iNodoVerificaRPTInput - The request to send to PagoPA
 * @param {PagamentiTelematiciPspNodoAsyncClient} pagoPASoapClient - SOAP client used to call PagoPa services
 * @return {Promise<Either<Error, esitoNodoVerificaRPTRisposta_ppt>>} The response provided by PagoPA as response
 */
export async function sendInodoVerificaRPTInput(
  iNodoVerificaRPTInput: nodoVerificaRPT_ppt,
  pagoPASoapClient: PagamentiTelematiciPspNodoAsyncClient
): Promise<Either<Error, esitoNodoVerificaRPTRisposta_ppt>> {
  try {
    const nodoVerificaRPT = await pagoPASoapClient.nodoVerificaRPT(
      iNodoVerificaRPTInput
    );
    return right(nodoVerificaRPT.nodoVerificaRPTRisposta);
  } catch (exception) {
    return left(Error(exception));
  }
}

/**
 * Send a request to PagoPA to activate (lock) a payment (AttivaRPT)
 * @param {nodoAttivaRPT_ppt} iNodoAttivaRPTInput - The request to send to PagoPA
 * @param {pagamentiTelematiciPSPNodoClient} pagoPASoapClient - SOAP client used to call PagoPa services
 * @return {Promise<Either<Error, esitoNodoAttivaRPTRisposta_ppt>>} The response provided by PagoPA as response
 */
export async function sendInodoAttivaRPTInputToPagoPa(
  iNodoAttivaRPTInput: nodoAttivaRPT_ppt,
  pagoPASoapClient: PagamentiTelematiciPspNodoAsyncClient
): Promise<Either<Error, esitoNodoAttivaRPTRisposta_ppt>> {
  try {
    const nodoAttivaRPT = await pagoPASoapClient.nodoAttivaRPT(
      iNodoAttivaRPTInput
    );
    return right(nodoAttivaRPT.nodoAttivaRPTRisposta);
  } catch (exception) {
    return left(Error(exception));
  }
}
