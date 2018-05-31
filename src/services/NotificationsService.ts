/**
 * Notification Services
 * Provide services related to Notification (Avvisatura) to communicate with PagoPaAPI and Cd Avviso API
 */

import { Either, Left, left, Right } from "fp-ts/lib/Either";
import { clients } from "italia-pagopa-api";
import {
  InodoAggiornaIscrizioniAvvisaturaInput,
  InodoAggiornaIscrizioniAvvisaturaOutput
} from "italia-pagopa-api/dist/wsdl-lib/IscrizioniAvvisaturaService/PPTPort";
import { CDAvvisiConfig, PagoPaConfig } from "../Configuration";
import { ControllerError } from "../enums/ControllerError";

import { NotificationsDispatchRequest } from "../types/controllers/NotificationsDispatchRequest";

// Send a request to PagoPaAPI to update subscription (Activation or Deactivation)
export async function updateNotificationsSubscriptionToPagoPaAPI(
  iNodoAggiornaIscrizione: InodoAggiornaIscrizioniAvvisaturaInput,
  pagoPaConfig: PagoPaConfig
): Promise<Either<ControllerError, InodoAggiornaIscrizioniAvvisaturaOutput>> {
  const iscrizioniAvvisaturaClientBase = await clients.createIscrizioniAvvisaturaClient(
    {
      endpoint:
        pagoPaConfig.HOST +
        ":" +
        pagoPaConfig.PORT +
        pagoPaConfig.SERVICES.NOTIFICATIONS_UPDATE_SUBSCRIPTION,
      envelopeKey: "soapenv"
    }
  );

  const iscrizioniAvvisaturaClient = new clients.IscrizioniAvvisaturaAsyncClient(
    iscrizioniAvvisaturaClientBase
  );

  const nodoAggiornaIscrizioneAvvisatura = await iscrizioniAvvisaturaClient.nodoAggiornaIscrizioniAvvisatura(
    iNodoAggiornaIscrizione
  );

  if (nodoAggiornaIscrizioneAvvisatura.esitoOperazione === "KO") {
    return new Left(ControllerError.ERROR_API_UNAVAILABLE);
  }
  return new Right(nodoAggiornaIscrizioneAvvisatura);
}

// Send a notification to CD Avvisi API
export async function sendNotificationToAPIAvvisi(
  notificationsDispatchRequest: NotificationsDispatchRequest,
  cdAvvisiConfig: CDAvvisiConfig
): Promise<Either<ControllerError, void>> {
  return new Left(ControllerError.ERROR_API_UNAVAILABLE);
}
