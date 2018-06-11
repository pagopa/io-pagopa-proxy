/**
 * Payments Converter
 * Data Converter for Payments Request\Responses between PagoPa and BackendAPP types
 */
import { Either, left, right } from "fp-ts/lib/Either";
import { ValidationError } from "io-ts";
import {
  codificaInfrastrutturaPSPEnum,
  IcdInfoWispInput,
  InodoAttivaRPTInput,
  InodoAttivaRPTOutput,
  InodoVerificaRPTInput,
  InodoVerificaRPTOutput
} from "italia-pagopa-api/dist/wsdl-lib/PagamentiTelematiciPspNodoservice/PPTPort";
import { PagoPaConfig } from "../Configuration";
import { PaymentsActivationRequest } from "../types/controllers/PaymentsActivationRequest";
import { PaymentsActivationResponse } from "../types/controllers/PaymentsActivationResponse";
import { PaymentsCheckRequest } from "../types/controllers/PaymentsCheckRequest";
import { PaymentsCheckResponse } from "../types/controllers/PaymentsCheckResponse";
import { PaymentsStatusUpdateRequest } from "../types/controllers/PaymentsStatusUpdateRequest";
import { CodiceContestoPagamento } from "../types/PagoPaTypes";

// Convert PaymentsCheckRequest (controller) to PaymentsCheckRequestPagoPa (PagoPa API)
export function getPaymentsCheckRequestPagoPa(
  pagoPaConfig: PagoPaConfig,
  paymentsCheckRequest: PaymentsCheckRequest,
  codiceContestoPagamento: CodiceContestoPagamento
): Either<Error, InodoVerificaRPTInput> {
  // TODO: [#158209998] Remove try\catch and replace it with decode when io-ts types will be ready
  try {
    return right({
      identificativoPSP: pagoPaConfig.IDENTIFIER.IDENTIFICATIVO_PSP,
      identificativoIntermediarioPSP:
        pagoPaConfig.IDENTIFIER.IDENTIFICATIVO_INTERMEDIARIO_PSP,
      identificativoCanale: pagoPaConfig.IDENTIFIER.IDENTIFICATIVO_CANALE,
      password: pagoPaConfig.IDENTIFIER.TOKEN,
      codiceContestoPagamento,
      codificaInfrastrutturaPSP: codificaInfrastrutturaPSPEnum.QR_CODE,
      codiceIdRPT: {
        CF: paymentsCheckRequest.codiceIdRPT.CF,
        AuxDigit: paymentsCheckRequest.codiceIdRPT.AuxDigit,
        CodStazPA: paymentsCheckRequest.codiceIdRPT.CodStazPA,
        CodIUV: paymentsCheckRequest.codiceIdRPT.CodIUV
      }
    });
  } catch (exception) {
    return left(new Error());
  }
}

// Convert PaymentsCheckResponsePagoPa (PagoPa API) to PaymentsCheckResponse (controller)
export function getPaymentsCheckResponse(
  iNodoVerificaRPTOutput: InodoVerificaRPTOutput,
  codiceContestoPagamento: CodiceContestoPagamento
): Either<Error, PaymentsCheckResponse> {
  const datiPagamentoPA =
    iNodoVerificaRPTOutput.nodoVerificaRPTRisposta.datiPagamentoPA;
  return PaymentsCheckResponse.decode({
    importoSingoloVersamento: datiPagamentoPA.importoSingoloVersamento,
    codiceContestoPagamento,
    ibanAccredito: datiPagamentoPA.ibanAccredito,
    causaleVersamento: datiPagamentoPA.causaleVersamento,
    enteBeneficiario: {
      codiceIdentificativoUnivoco:
        datiPagamentoPA.enteBeneficiario.identificativoUnivocoBeneficiario,
      denominazioneBeneficiario:
        datiPagamentoPA.enteBeneficiario.denominazioneBeneficiario,
      codiceUnitOperBeneficiario:
        datiPagamentoPA.enteBeneficiario.codiceUnitOperBeneficiario,
      denomUnitOperBeneficiario:
        datiPagamentoPA.enteBeneficiario.denomUnitOperBeneficiario,
      indirizzoBeneficiario:
        datiPagamentoPA.enteBeneficiario.indirizzoBeneficiario,
      civicoBeneficiario: datiPagamentoPA.enteBeneficiario.civicoBeneficiario,
      capBeneficiario: datiPagamentoPA.enteBeneficiario.capBeneficiario,
      localitaBeneficiario:
        datiPagamentoPA.enteBeneficiario.localitaBeneficiario,
      provinciaBeneficiario:
        datiPagamentoPA.enteBeneficiario.provinciaBeneficiario,
      nazioneBeneficiario: datiPagamentoPA.enteBeneficiario.nazioneBeneficiario
    },
    spezzoniCausaleVersamento: datiPagamentoPA.spezzoniCausaleVersamento
  }).mapLeft(() => {
    return new Error();
  });
}

// Convert PaymentsActivationRequest (controller) to PaymentsActivationRequestPagoPa (PagoPa API)
export function getPaymentsActivationRequestPagoPa(
  pagoPaConfig: PagoPaConfig,
  paymentsActivationRequest: PaymentsActivationRequest
): Either<Error, InodoAttivaRPTInput> {
  // TODO: [#158209998] Remove try\catch and replace it with decode when io-ts types will be ready
  try {
    return right({
      identificativoPSP: pagoPaConfig.IDENTIFIER.IDENTIFICATIVO_PSP,
      identificativoIntermediarioPSP:
        pagoPaConfig.IDENTIFIER.IDENTIFICATIVO_INTERMEDIARIO_PSP,
      identificativoCanale: pagoPaConfig.IDENTIFIER.IDENTIFICATIVO_CANALE,
      password: pagoPaConfig.IDENTIFIER.TOKEN,
      codiceContestoPagamento:
        paymentsActivationRequest.codiceContestoPagamento,
      identificativoIntermediarioPSPPagamento:
        pagoPaConfig.IDENTIFIER.IDENTIFICATIVO_INTERMEDIARIO_PSP,
      identificativoCanalePagamento:
        pagoPaConfig.IDENTIFIER.IDENTIFICATIVO_CANALE,
      codificaInfrastrutturaPSP: codificaInfrastrutturaPSPEnum.QR_CODE,
      codiceIdRPT: {
        CF: paymentsActivationRequest.codiceIdRPT.CF,
        AuxDigit: paymentsActivationRequest.codiceIdRPT.AuxDigit,
        CodStazPA: paymentsActivationRequest.codiceIdRPT.CodStazPA,
        CodIUV: paymentsActivationRequest.codiceIdRPT.CodIUV
      },
      datiPagamentoPSP: {
        importoSingoloVersamento:
          paymentsActivationRequest.importoSingoloVersamento
      }
    });
  } catch (exception) {
    return left(new Error());
  }
}

// Convert PaymentsActivationResponsePagoPa (PagoPa API) to PaymentsActivationkResponse (controller)
export function getPaymentsActivationResponse(
  iNodoAttivaRPTOutput: InodoAttivaRPTOutput
  // tslint:disable-next-line:readonly-array
): Either<ValidationError[], PaymentsActivationResponse> {
  const datiPagamentoPA =
    iNodoAttivaRPTOutput.nodoAttivaRPTRisposta.datiPagamentoPA;
  return PaymentsActivationResponse.decode({
    importoSingoloVersamento: datiPagamentoPA.importoSingoloVersamento,
    ibanAccredito: datiPagamentoPA.ibanAccredito,
    causaleVersamento: datiPagamentoPA.causaleVersamento,
    enteBeneficiario: {
      identificativoUnivocoBeneficiario:
        datiPagamentoPA.enteBeneficiario.identificativoUnivocoBeneficiario,
      denominazioneBeneficiario:
        datiPagamentoPA.enteBeneficiario.denominazioneBeneficiario,
      codiceUnitOperBeneficiario:
        datiPagamentoPA.enteBeneficiario.codiceUnitOperBeneficiario,
      denomUnitOperBeneficiario:
        datiPagamentoPA.enteBeneficiario.denomUnitOperBeneficiario,
      indirizzoBeneficiario:
        datiPagamentoPA.enteBeneficiario.indirizzoBeneficiario,
      civicoBeneficiario: datiPagamentoPA.enteBeneficiario.civicoBeneficiario,
      capBeneficiario: datiPagamentoPA.enteBeneficiario.capBeneficiario,
      localitaBeneficiario:
        datiPagamentoPA.enteBeneficiario.localitaBeneficiario,
      provinciaBeneficiario:
        datiPagamentoPA.enteBeneficiario.provinciaBeneficiario,
      nazioneBeneficiario: datiPagamentoPA.enteBeneficiario.nazioneBeneficiario
    },
    spezzoniCausaleVersamento: datiPagamentoPA.spezzoniCausaleVersamento
  });
}

// Convert PaymentsStatusUpdateRequestPagoPa (PagoPa API) to PaymentsStatusUpdateRequest (controller)
export function getPaymentsStatusUpdateRequest(
  paymentsStatusUpdateRequestPagoPa: IcdInfoWispInput
  // tslint:disable-next-line:readonly-array
): Either<ValidationError[], PaymentsStatusUpdateRequest> {
  return PaymentsStatusUpdateRequest.decode({
    codiceContestoPagamento:
      paymentsStatusUpdateRequestPagoPa.codiceContestoPagamento,
    idPagamento: paymentsStatusUpdateRequestPagoPa.idPagamento
  });
}
