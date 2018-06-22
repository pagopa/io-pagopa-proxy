/**
 * PaymentsService
 * Provide services related to Payments (Nodo) to communicate with PagoPA and Backend API
 */

import { Either, left, right } from "fp-ts/lib/Either";
import { PagamentiTelematiciPspNodoAsyncClient } from "italia-pagopa-api/dist/lib/clients";
import {
  InodoAttivaRPTInput,
  InodoAttivaRPTOutput,
  InodoVerificaRPTInput,
  InodoVerificaRPTOutput
} from "italia-pagopa-api/dist/wsdl-lib/PagamentiTelematiciPspNodoservice/PPTPort";

/**
 * Send a request to PagoPA to retrieve payment info (VerificaRPT)
 * @param {InodoVerificaRPTInput} iNodoVerificaRPTInput - The request to send to PagoPA
 * @param {PagamentiTelematiciPspNodoAsyncClient} pagamentiTelematiciPSPNodoClient - SOAP client used to call PagoPa services
 * @return {Promise<Either<Error, InodoVerificaRPTOutput>>} The response provided by PagoPA as response
 */
export async function sendInodoVerificaRPTInput(
  iNodoVerificaRPTInput: InodoVerificaRPTInput,
  pagamentiTelematiciPSPNodoClient: PagamentiTelematiciPspNodoAsyncClient
): Promise<Either<Error, InodoVerificaRPTOutput>> {
  try {
    const nodoVerificaRPT = await pagamentiTelematiciPSPNodoClient.nodoVerificaRPT(
      iNodoVerificaRPTInput
    );
    return right(nodoVerificaRPT);
  } catch (exception) {
    return left(Error(exception));
  }
}

/**
 * Send a request to PagoPA to activate (lock) a payment (AttivaRPT)
 * @param {InodoAttivaRPTInput} iNodoAttivaRPTInput - The request to send to PagoPA
 * @param {pagamentiTelematiciPSPNodoClient} PagamentiTelematiciPspNodoAsyncClient - SOAP client used to call PagoPa services
 * @return {Promise<Either<Error, InodoAttivaRPTOutput>>} The response provided by PagoPA as response
 */
export async function sendInodoAttivaRPTInputToPagoPa(
  iNodoAttivaRPTInput: InodoAttivaRPTInput,
  pagamentiTelematiciPSPNodoClient: PagamentiTelematiciPspNodoAsyncClient
): Promise<Either<Error, InodoAttivaRPTOutput>> {
  try {
    const nodoAttivaRPT = await pagamentiTelematiciPSPNodoClient.nodoAttivaRPT(
      iNodoAttivaRPTInput
    );
    return right(nodoAttivaRPT);
  } catch (exception) {
    return left(Error(exception));
  }
}
