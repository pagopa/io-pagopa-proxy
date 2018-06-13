/**
 * Payments Converter
 * Data Converter for Payments Request\Responses between PagoPa and BackendAPP types
 */
import { Either, left, right } from "fp-ts/lib/Either";
import { Validation } from "io-ts";
import {
  codificaInfrastrutturaPSPEnum,
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
import { CodiceContestoPagamento } from "../types/PagoPaTypes";

/**
 * Convert PaymentsCheckRequest (BackendApp request) to InodoVerificaRPTInput (PagoPa request)
 * @param {PagoPaConfig} pagoPaConfig - PagoPa config, containing static information to put into response
 * @param {PaymentsCheckRequest} paymentsCheckRequest - Message to convert
 * @param {CodiceContestoPagamento} codiceContestoPagamento - Session Identifier to put into response
 * @return {Either<Error, InodoVerificaRPTInput>} Converted object
 */
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

/**
 * Convert InodoVerificaRPTOutput (PagoPa response) to PaymentsCheckResponse (BackendApp response)
 * @param {InodoVerificaRPTOutput} iNodoVerificaRPTOutput - Message to convert
 * @param {CodiceContestoPagamento} codiceContestoPagamento - Session Identifier to put into response
 * @return {Either<Error, PaymentsCheckResponse>>} Converted object
 */
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

/**
 * Convert PaymentsActivationRequest (BackendApp request) to InodoAttivaRPTInput (PagoPa request)
 * @param {PagoPaConfig} pagoPaConfig - PagoPa config, containing static information to put into response
 * @param {PaymentsActivationRequest} paymentsActivationRequest - Message to convert
 * @return {Either<Error, InodoAttivaRPTInput>} Converted object
 */
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

/**
 * Convert InodoAttivaRPTOutput (PagoPa response) to PaymentsActivationResponse (BackendApp response)
 * @param {InodoAttivaRPTOutput} iNodoAttivaRPTOutput - Message to convert
 * @return {Validation<PaymentsActivationResponse>} Converted object
 */
export function getPaymentsActivationResponse(
  iNodoAttivaRPTOutput: InodoAttivaRPTOutput
): Validation<PaymentsActivationResponse> {
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
