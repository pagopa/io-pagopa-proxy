/**
 * PaymentsService
 * Provide services related to Payments (Nodo) to communicate with PagoPa and Backend API
 */

import { Either, Left, Right } from "fp-ts/lib/Either";

import { clients as pagoPaSoapClient } from "italia-pagopa-api";
import {
  InodoAttivaRPTInput,
  InodoAttivaRPTOutput,
  InodoVerificaRPTInput,
  InodoVerificaRPTOutput
} from "italia-pagopa-api/dist/wsdl-lib/PagamentiTelematiciPspNodoservice/PPTPort";
import { PagoPaConfig } from "../Configuration";
import { ControllerError } from "../enums/ControllerError";

// Send a request to PagoPa to check payment info
export async function sendPaymentCheckRequestToPagoPa(
  iNodoVerificaRPTInput: InodoVerificaRPTInput,
  pagoPaConfig: PagoPaConfig
): Promise<Either<ControllerError, InodoVerificaRPTOutput>> {
  try {
    const pagamentiTelematiciPSPNodoClientBase = await pagoPaSoapClient.createPagamentiTelematiciPspNodoClient(
      {
        endpoint: `${pagoPaConfig.HOST}:${pagoPaConfig.PORT}${
          pagoPaConfig.SERVICES.PAYMENTS_CHECK
        }`,
        envelopeKey: "soapenv"
      }
    );

    const pagamentiTelematiciPSPNodoClient = new pagoPaSoapClient.PagamentiTelematiciPspNodoAsyncClient(
      pagamentiTelematiciPSPNodoClientBase
    );

    const nodoVerificaRPT = await pagamentiTelematiciPSPNodoClient.nodoVerificaRPT(
      iNodoVerificaRPTInput
    );

    return new Right(nodoVerificaRPT);
  } catch (exception) {
    return new Left(ControllerError.ERROR_API_UNAVAILABLE);
  }
}

// Send a request to PagoPaAPI to activate a payment
export async function sendPaymentsActivationRequestToPagoPaAPI(
  iNodoVerificaRPTInput: InodoAttivaRPTInput,
  pagoPaConfig: PagoPaConfig
): Promise<Either<ControllerError, InodoAttivaRPTOutput>> {
  try {
    const pagamentiTelematiciPSPNodoClientBase = await pagoPaSoapClient.createPagamentiTelematiciPspNodoClient(
      {
        endpoint: `${pagoPaConfig.HOST}:${pagoPaConfig.PORT}${
          pagoPaConfig.SERVICES.PAYMENTS_CHECK
        }`,
        envelopeKey: "soapenv"
      }
    );

    const pagamentiTelematiciPSPNodoClient = new pagoPaSoapClient.PagamentiTelematiciPspNodoAsyncClient(
      pagamentiTelematiciPSPNodoClientBase
    );

    const nodoAttivaRPT = await pagamentiTelematiciPSPNodoClient.nodoAttivaRPT(
      iNodoVerificaRPTInput
    );
    return new Right(nodoAttivaRPT);
  } catch (exception) {
    return new Left(ControllerError.ERROR_API_UNAVAILABLE);
  }
}
