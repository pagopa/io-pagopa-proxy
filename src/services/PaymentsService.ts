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
import { BackendAppConfig, PagoPaConfig } from "../Configuration";
import { ControllerError } from "../enums/ControllerError";
import { PaymentsStatusUpdateRequest } from "../types/controllers/PaymentsStatusUpdateRequest";

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
    if (nodoVerificaRPT.nodoVerificaRPTRisposta.esito === "KO") {
      return new Left(ControllerError.ERROR_API_UNAVAILABLE);
    }
    return new Right(nodoVerificaRPT);
  } catch {
    return new Left(ControllerError.REQUEST_REJECTED);
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
    if (nodoAttivaRPT.nodoAttivaRPTRisposta.esito === "KO") {
      return new Left(ControllerError.ERROR_API_UNAVAILABLE);
    }
    return new Right(nodoAttivaRPT);
  } catch {
    return new Left(ControllerError.REQUEST_REJECTED);
  }
}

// Send a payment status update to API Notifica
export async function sendPaymentsStatusUpdateToAPINotifica(
  backendAppConfig: BackendAppConfig,
  paymentsStatusUpdateRequest: PaymentsStatusUpdateRequest
): Promise<Either<ControllerError, boolean>> {
  try {
    const response = await fetch(
      `${backendAppConfig.HOST}:${backendAppConfig.PORT}${
        backendAppConfig.SERVICES.PAYMENTS_STATUS_UPDATE
      }`,
      {
        method: "POST",
        body: JSON.stringify(paymentsStatusUpdateRequest)
      }
    );
    if (response.status === 200) {
      return new Right(true);
    }
  } catch (exception) {
    return new Left(ControllerError.ERROR_API_UNAVAILABLE);
  }
  return new Left(ControllerError.REQUEST_REJECTED);
}
