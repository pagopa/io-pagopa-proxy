/**
 * PaymentsService
 * Provide services related to Payments (Nodo) to communicate with PagoPa and Backend API
 */

import { Either, left, right } from "fp-ts/lib/Either";
import { clients as pagoPaSoapClient } from "italia-pagopa-api";
import {
  InodoAttivaRPTInput,
  InodoAttivaRPTOutput,
  InodoVerificaRPTInput,
  InodoVerificaRPTOutput
} from "italia-pagopa-api/dist/wsdl-lib/PagamentiTelematiciPspNodoservice/PPTPort";
import { PagoPaConfig } from "../Configuration";

// TODO : [#158215861] Move it on PagoPaAPI
const envelopeKey = "soapenv";

/**
 * Send a request to PagoPa to retrieve payment info (VerificaRPT)
 * @param {InodoVerificaRPTInput} iNodoVerificaRPTInput - The request to send to PagoPa
 * @param {PagoPaConfig} pagoPaConfig - Configuration about PagoPa WS to contact
 * @return {Promise<Either<Error, InodoVerificaRPTOutput>>} The response provided by PagoPa as response
 */
export async function sendPaymentCheckRequestToPagoPa(
  iNodoVerificaRPTInput: InodoVerificaRPTInput,
  pagoPaConfig: PagoPaConfig
): Promise<Either<Error, InodoVerificaRPTOutput>> {
  try {
    const pagamentiTelematiciPSPNodoClientBase = await pagoPaSoapClient.createPagamentiTelematiciPspNodoClient(
      {
        endpoint: `${pagoPaConfig.HOST}:${pagoPaConfig.PORT}${
          pagoPaConfig.SERVICES.PAYMENTS_CHECK
        }`,
        envelopeKey
      }
    );

    const pagamentiTelematiciPSPNodoClient = new pagoPaSoapClient.PagamentiTelematiciPspNodoAsyncClient(
      pagamentiTelematiciPSPNodoClientBase
    );

    const nodoVerificaRPT = await pagamentiTelematiciPSPNodoClient.nodoVerificaRPT(
      iNodoVerificaRPTInput
    );

    return right(nodoVerificaRPT);
  } catch (exception) {
    return left(new Error());
  }
}

/**
 * Send a request to PagoPa to activate (lock) a payment (AttivaRPT)
 * @param {InodoAttivaRPTInput} iNodoAttivaRPTInput - The request to send to PagoPa
 * @param {PagoPaConfig} pagoPaConfig - Configuration about PagoPa WS to contact
 * @return {Promise<Either<Error, InodoAttivaRPTOutput>>} The response provided by PagoPa as response
 */
export async function sendPaymentsActivationRequestToPagoPaAPI(
  iNodoAttivaRPTInput: InodoAttivaRPTInput,
  pagoPaConfig: PagoPaConfig
): Promise<Either<Error, InodoAttivaRPTOutput>> {
  try {
    const pagamentiTelematiciPSPNodoClientBase = await pagoPaSoapClient.createPagamentiTelematiciPspNodoClient(
      {
        endpoint: `${pagoPaConfig.HOST}:${pagoPaConfig.PORT}${
          pagoPaConfig.SERVICES.PAYMENTS_CHECK
        }`,
        envelopeKey
      }
    );
    const pagamentiTelematiciPSPNodoClient = new pagoPaSoapClient.PagamentiTelematiciPspNodoAsyncClient(
      pagamentiTelematiciPSPNodoClientBase
    );

    const nodoAttivaRPT = await pagamentiTelematiciPSPNodoClient.nodoAttivaRPT(
      iNodoAttivaRPTInput
    );
    return right(nodoAttivaRPT);
  } catch (exception) {
    return left(new Error());
  }
}
