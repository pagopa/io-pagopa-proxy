/**
 * PaymentsService
 * Provide services related to Payments (Nodo) to communicate with PagoPa and Backend API
 */

import { Either, Left, Right } from "fp-ts/lib/Either";

import { clients as pagoPaSoapClient } from "italia-pagopa-api";
import {
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

    const nodoVerificaRPTOutput = await pagamentiTelematiciPSPNodoClient.nodoVerificaRPT(
      iNodoVerificaRPTInput
    );
    if (nodoVerificaRPTOutput.nodoVerificaRPTRisposta.esito === "KO") {
      return new Left(ControllerError.REQUEST_REJECTED);
    }
    return new Right(nodoVerificaRPTOutput);
  } catch (exception) {
    return new Left(ControllerError.ERROR_API_UNAVAILABLE);
  }
}

// Send a request to PagoPa to activate a payment
export async function sendPaymentsActivationRequestToPagoPa(): Promise<
  Either<ControllerError, InodoAttivaRPTOutput>
> {
  // TODO:[#157911366] Chiamate SOAP verso PagoPA
  return new Left(ControllerError.ERROR_API_UNAVAILABLE);
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
