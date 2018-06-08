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

// Send a request to PagoPa to check payment info
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

// Send a request to PagoPaAPI to activate a payment
export async function sendPaymentsActivationRequestToPagoPaAPI(
  iNodoVerificaRPTInput: InodoAttivaRPTInput,
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
      iNodoVerificaRPTInput
    );
    return right(nodoAttivaRPT);
  } catch (exception) {
    return left(new Error());
  }
}
