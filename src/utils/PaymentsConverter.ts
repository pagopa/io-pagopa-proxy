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
import { PaymentActivationsPostRequest } from "../types/api/PaymentActivationsPostRequest";
import { PaymentActivationsPostResponse } from "../types/api/PaymentActivationsPostResponse";
import { PaymentRequestsGetResponse } from "../types/api/PaymentRequestsGetResponse";
import { RptId } from "../types/api/RptId";

/**
 * Define InodoVerificaRPTInput (PagoPA request) using information provided by BackendApp
 * @param {PagoPAConfig} PagoPAConfig - PagoPA config, containing static information to put into response
 * @param {RptId} rptId - Unique identifier for payment (fiscalCode + numeroAvviso)
 * @param {CodiceContestoPagamento} codiceContestoPagamento - Transaction Identifier to put into response
 * @return {Either<Error, InodoVerificaRPTInput>} Converted object
 */
export function getInodoVerificaRPTInput(
  pagoPAConfig: PagoPAConfig,
  rptId: RptId,
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
        CF: getFiscalCode(rptId),
        AuxDigit: getAuxDigit(rptId),
        CodStazPA: getCodStazPA(rptId),
        CodIUV: getCodIUV(rptId)
      }
    });
  } catch (exception) {
    return left(Error(exception));
  }
}

/**
 * Convert InodoVerificaRPTOutput (PagoPA response) to PaymentRequestsGetResponse (BackendApp response)
 * @param {InodoVerificaRPTOutput} iNodoVerificaRPTOutput - Message to convert
 * @param {CodiceContestoPagamento} codiceContestoPagamento - Transaction Identifier to put into response
 * @return {Validation<PaymentRequestsGetResponse>} Converted object
 */
export function getPaymentRequestsGetResponse(
  iNodoVerificaRPTOutput: InodoVerificaRPTOutput,
  codiceContestoPagamento: CodiceContestoPagamento
): Validation<PaymentRequestsGetResponse> {
  const datiPagamentoPA =
    iNodoVerificaRPTOutput.nodoVerificaRPTRisposta.datiPagamentoPA;
  return PaymentRequestsGetResponse.decode({
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
 * Convert PaymentActivationsPostRequest (BackendApp request) to InodoAttivaRPTInput (PagoPA request)
 * @param {PagoPAConfig} PagoPAConfig - PagoPA config, containing static information to put into response
 * @param {PaymentActivationsPostRequest} paymentActivationsPostRequest - Message to convert
 * @return {Either<Error, InodoAttivaRPTInput>} Converted object
 */
export function getInodoAttivaRPTInput(
  pagoPAConfig: PagoPAConfig,
  paymentActivationsPostRequest: PaymentActivationsPostRequest
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
        paymentActivationsPostRequest.codiceContestoPagamento,
      identificativoIntermediarioPSPPagamento:
        pagoPAConfig.IDENTIFIER.IDENTIFICATIVO_INTERMEDIARIO_PSP,
      identificativoCanalePagamento:
        pagoPAConfig.IDENTIFIER.IDENTIFICATIVO_CANALE,
      codificaInfrastrutturaPSP: codificaInfrastrutturaPSPEnum.QR_CODE,
      codiceIdRPT: {
        CF: getFiscalCode(paymentActivationsPostRequest.rptId),
        AuxDigit: getAuxDigit(paymentActivationsPostRequest.rptId),
        CodStazPA: getCodStazPA(paymentActivationsPostRequest.rptId),
        CodIUV: getCodIUV(paymentActivationsPostRequest.rptId)
      },
      datiPagamentoPSP: {
        importoSingoloVersamento:
          paymentActivationsPostRequest.importoSingoloVersamento
      }
    });
  } catch (exception) {
    return left(Error(exception));
  }
}

/**
 * Convert InodoAttivaRPTOutput (PagoPA response) to PaymentActivationsPostResponse (BackendApp response)
 * @param {InodoAttivaRPTOutput} iNodoAttivaRPTOutput - Message to convert
 * @return {Validation<PaymentActivationsPostResponse>} Converted object
 */
export function getPaymentActivationsPostResponse(
  iNodoAttivaRPTOutput: InodoAttivaRPTOutput
): Validation<PaymentActivationsPostResponse> {
  const datiPagamentoPA =
    iNodoAttivaRPTOutput.nodoAttivaRPTRisposta.datiPagamentoPA;
  return PaymentActivationsPostResponse.decode({
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

// TODO: [#158463790] Replace this methods and RptId object with a common definition to share with App
export function getAuxDigit(rptId: string): string {
  if (rptId !== undefined) {
    return "0";
  }
  return "ERROR";
}
// tslint:disable-next-line
export function getCodIUV(rptId: string): string {
  if (rptId !== undefined) {
    return "010101010101010";
  }
  return "ERROR";
}
// tslint:disable-next-line
export function getCodStazPA(rptId: string): string {
  if (rptId !== undefined) {
    return "22";
  }
  return "ERROR";
}
// tslint:disable-next-line
export function getFiscalCode(rptId: string): string {
  if (rptId !== undefined) {
    return "DVCMCD99D30E611V";
  }
  return "ERROR";
}
