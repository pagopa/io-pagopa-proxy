/**
 * Payments Converter
 * Data Converter for Payments Request\Responses between PagoPA and BackendAPP types
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
import { PagoPAConfig } from "../Configuration";
import { CodiceContestoPagamento } from "../types/api/CodiceContestoPagamento";
import { PaymentsActivationRequest } from "../types/api/PaymentsActivationRequest";
import { PaymentsActivationResponse } from "../types/api/PaymentsActivationResponse";
import { PaymentsCheckRequest } from "../types/api/PaymentsCheckRequest";
import { PaymentsCheckResponse } from "../types/api/PaymentsCheckResponse";

/**
 * Convert PaymentsCheckRequest (BackendApp request) to InodoVerificaRPTInput (PagoPA request)
 * @param {PagoPAConfig} PagoPAConfig - PagoPA config, containing static information to put into response
 * @param {PaymentsCheckRequest} paymentsCheckRequest - Message to convert
 * @param {CodiceContestoPagamento} codiceContestoPagamento - Transaction Identifier to put into response
 * @return {Either<Error, InodoVerificaRPTInput>} Converted object
 */
export function getPaymentsCheckRequestPagoPA(
  pagoPAConfig: PagoPAConfig,
  paymentsCheckRequest: PaymentsCheckRequest,
  codiceContestoPagamento: CodiceContestoPagamento
): Either<Error, InodoVerificaRPTInput> {
  // TODO: [#158209998] Remove try\catch and replace it with decode when io-ts types will be ready
  try {
    return right({
      identificativoPSP: pagoPAConfig.IDENTIFIER.IDENTIFICATIVO_PSP,
      identificativoIntermediarioPSP:
        pagoPAConfig.IDENTIFIER.IDENTIFICATIVO_INTERMEDIARIO_PSP,
      identificativoCanale: pagoPAConfig.IDENTIFIER.IDENTIFICATIVO_CANALE,
      password: pagoPAConfig.IDENTIFIER.TOKEN,
      codiceContestoPagamento,
      codificaInfrastrutturaPSP: codificaInfrastrutturaPSPEnum.QR_CODE,
      codiceIdRPT: {
        CF: paymentsCheckRequest.codiceIdRPT.CF,
        AuxDigit: String(paymentsCheckRequest.codiceIdRPT.AuxDigit),
        CodStazPA: paymentsCheckRequest.codiceIdRPT.CodStazPA,
        CodIUV: paymentsCheckRequest.codiceIdRPT.CodIUV
      }
    });
  } catch (exception) {
    return left(Error(exception));
  }
}

/**
 * Convert InodoVerificaRPTOutput (PagoPA response) to \ (BackendApp response)
 * @param {InodoVerificaRPTOutput} iNodoVerificaRPTOutput - Message to convert
 * @param {CodiceContestoPagamento} codiceContestoPagamento - Transaction Identifier to put into response
 * @return {Validation<PaymentsCheckResponse>} Converted object
 */
export function getPaymentsCheckResponse(
  iNodoVerificaRPTOutput: InodoVerificaRPTOutput,
  codiceContestoPagamento: CodiceContestoPagamento
): Validation<PaymentsCheckResponse> {
  const datiPagamentoPA =
    iNodoVerificaRPTOutput.nodoVerificaRPTRisposta.datiPagamentoPA;
  return PaymentsCheckResponse.decode({
    importoSingoloVersamento: datiPagamentoPA.importoSingoloVersamento,
    codiceContestoPagamento,
    ibanAccredito: datiPagamentoPA.ibanAccredito,
    causaleVersamento: datiPagamentoPA.causaleVersamento,
    enteBeneficiario: {
      identificativoUnivocoBeneficiario:
        datiPagamentoPA.enteBeneficiario.identificativoUnivocoBeneficiario
          .codiceIdentificativoUnivoco,
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

/**
 * Convert PaymentsActivationRequest (BackendApp request) to InodoAttivaRPTInput (PagoPA request)
 * @param {PagoPAConfig} PagoPAConfig - PagoPA config, containing static information to put into response
 * @param {PaymentsActivationRequest} paymentsActivationRequest - Message to convert
 * @return {Either<Error, InodoAttivaRPTInput>} Converted object
 */
export function getPaymentsActivationRequestPagoPA(
  pagoPAConfig: PagoPAConfig,
  paymentsActivationRequest: PaymentsActivationRequest
): Either<Error, InodoAttivaRPTInput> {
  // TODO: [#158209998] Remove try\catch and replace it with decode when io-ts types will be ready
  try {
    return right({
      identificativoPSP: pagoPAConfig.IDENTIFIER.IDENTIFICATIVO_PSP,
      identificativoIntermediarioPSP:
        pagoPAConfig.IDENTIFIER.IDENTIFICATIVO_INTERMEDIARIO_PSP,
      identificativoCanale: pagoPAConfig.IDENTIFIER.IDENTIFICATIVO_CANALE,
      password: pagoPAConfig.IDENTIFIER.TOKEN,
      codiceContestoPagamento:
        paymentsActivationRequest.codiceContestoPagamento,
      identificativoIntermediarioPSPPagamento:
        pagoPAConfig.IDENTIFIER.IDENTIFICATIVO_INTERMEDIARIO_PSP,
      identificativoCanalePagamento:
        pagoPAConfig.IDENTIFIER.IDENTIFICATIVO_CANALE,
      codificaInfrastrutturaPSP: codificaInfrastrutturaPSPEnum.QR_CODE,
      codiceIdRPT: {
        CF: paymentsActivationRequest.codiceIdRPT.CF,
        AuxDigit: String(paymentsActivationRequest.codiceIdRPT.AuxDigit),
        CodStazPA: paymentsActivationRequest.codiceIdRPT.CodStazPA,
        CodIUV: paymentsActivationRequest.codiceIdRPT.CodIUV
      },
      datiPagamentoPSP: {
        importoSingoloVersamento:
          paymentsActivationRequest.importoSingoloVersamento
      }
    });
  } catch (exception) {
    return left(Error(exception));
  }
}

/**
 * Convert InodoAttivaRPTOutput (PagoPA response) to PaymentsActivationResponse (BackendApp response)
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
        datiPagamentoPA.enteBeneficiario.identificativoUnivocoBeneficiario
          .codiceIdentificativoUnivoco,
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
