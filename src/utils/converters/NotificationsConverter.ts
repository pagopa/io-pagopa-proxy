/**
 * Notifications Converter
 * Data Converter for Notifications Request\Responses
 */

//tslint:disable
import { Either, Left, Right } from "fp-ts/lib/Either";
import { NotificationsDispatchRequestPagoPa } from "../../FakePagoPaExternalTypes";
import { NotificationsDispatchRequest } from "../../types/controllers/NotificationsDispatchRequest";
import { FiscalCode } from "../../types/CommonTypes";
import { NotificationSubscriptionRequestType } from "../../enums/NotificationSubscriptionType";
import { TipoIdentificativoUnivocoType } from "../../enums/TipoIdentificativoUnivocoType";
import {
  InodoAggiornaIscrizioniAvvisaturaInput,
  PPTPortTypes
} from "italia-pagopa-api-custom/dist/wsdl-lib/IscrizioniAvvisaturaService/PPTPort";
import { CONFIG } from "../../Configuration";
import { ControllerError } from "../../enums/ControllerError";

// Convert NotificationsDispatchRequestPagoPa (PagoPa API) to NotificationsDispatchRequest (CD Avvisi API)
export function getNotificationsDispatchRequest(
  notificationsDispatchRequestPagoPa: NotificationsDispatchRequestPagoPa
): Either<Error, NotificationsDispatchRequest> {
  return new Left(new Error("TODO"));
}

export function getUpdateNotificationsSubscriptionRequestPagoPaAPI(
  fiscalCode: FiscalCode,
  requestType: NotificationSubscriptionRequestType
): Either<Error, InodoAggiornaIscrizioniAvvisaturaInput> {
  try {
    const identificativoUnivocoSoggetto: PPTPortTypes.IidentificativoUnivocoSoggetto = {
      "sac:tipoIdentificativoUnivoco": TipoIdentificativoUnivocoType.FISICA,
      "sac:codiceIdentificativoUnivoco": fiscalCode
    };

    const datiNotifica: PPTPortTypes.IdatiNotifica = {
      dataOraRichiesta: CONFIG.PAGOPA_API.DATI_NOTIFICA.DATA_ORA_RICHIESTA,
      identificativoMessaggioRichiesta:
        CONFIG.PAGOPA_API.DATI_NOTIFICA.IDENTIFICATIVO_MESSAGGIO_RICHIESTA,
      identificativoUnivocoSoggetto: identificativoUnivocoSoggetto,
      azioneDiAggiornamento: requestType
    };

    const nodoAggiornaIscrizioneAvvisatura: InodoAggiornaIscrizioniAvvisaturaInput = {
      identificativoPSP: CONFIG.PAGOPA_API.IDENTIFIER.IDENTIFICATIVO_PSP,
      identificativoIntermediarioPSP:
        CONFIG.PAGOPA_API.IDENTIFIER.IDENTIFICATIVO_INTERMEDIARIO_PSP,
      identificativoCanale: CONFIG.PAGOPA_API.IDENTIFIER.IDENTIFICATIVO_CANALE,
      password: CONFIG.PAGOPA_API.IDENTIFIER.TOKEN,
      datiNotifica: datiNotifica
    };
    return new Right(nodoAggiornaIscrizioneAvvisatura);
  } catch {
    return new Left(new Error(ControllerError.ERROR_INVALID_INPUT));
  }
}
