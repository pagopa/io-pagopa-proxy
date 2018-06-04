/**
 * Payments Services
 * Provide services related to Payments (Nodo) to communicate with PagoPaAPI and Cd Avviso API
 */

import { Either, Left, Right } from "fp-ts/lib/Either";

import { clients as pagoPaSoapClient } from "italia-pagopa-api";
import {
  InodoAttivaRPTOutput,
  InodoVerificaRPTInput,
  InodoVerificaRPTOutput
} from "italia-pagopa-api/dist/wsdl-lib/PagamentiTelematiciPspNodoservice/PPTPort";
import { CONFIG } from "../Configuration";
import { ControllerError } from "../enums/ControllerError";

// Send a request to PagoPaAPI to check payment info
export async function sendPaymentCheckRequestToPagoPaAPI(
  iNodoVerificaRPTInput: InodoVerificaRPTInput
): Promise<Either<ControllerError, InodoVerificaRPTOutput>> {
  const pagamentiTelematiciPSPNodoClientBase = await pagoPaSoapClient.createPagamentiTelematiciPspNodoClient(
    {
      endpoint: `${CONFIG.PAGOPA.HOST}:${CONFIG.PAGOPA.PORT}${
        CONFIG.PAGOPA.SERVICES
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
}

// Send a request to PagoPaAPI to activate a payment
export async function sendPaymentsActivationRequestToPagoPaAPI(): /*iNodoAttivaRPTInput: InodoAttivaRPTInput,
  pagoPaConfig: PagoPaConfig*/ Promise<
  Either<ControllerError, InodoAttivaRPTOutput>
> {
  // TODO:[#157911366] Chiamate SOAP verso PagoPA
  return new Left(ControllerError.ERROR_API_UNAVAILABLE);
}

// Send a payment status update to CD Avvisi API
export async function sendPaymentsStatusUpdateToAPIAvvisi(): // paymentsStatusUpdateRequestPagoPa: IcdInfoWispInput,
// cdAvvisiConfig: CDAvvisiConfig
Promise<Either<ControllerError, void>> {
  // TODO: [#157911381] Chiamate Restful verso il Backend CD
  return new Left(ControllerError.ERROR_API_UNAVAILABLE);
}
