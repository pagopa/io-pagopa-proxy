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
  InodoVerificaRPTOutput,
  PPTPortTypes
} from "italia-pagopa-api/dist/wsdl-lib/PagamentiTelematiciPspNodoservice/PPTPort";
import { RptId } from "italia-ts-commons/lib/pagopa";
import { PagoPAConfig } from "../Configuration";
import { CodiceContestoPagamento } from "../types/api/CodiceContestoPagamento";
import { PaymentActivationsPostRequest } from "../types/api/PaymentActivationsPostRequest";
import { PaymentActivationsPostResponse } from "../types/api/PaymentActivationsPostResponse";
import { PaymentRequestsGetResponse } from "../types/api/PaymentRequestsGetResponse";

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
    const codiceIdRPT = getCodiceIdRpt(rptId);
    return right({
      identificativoPSP: pagoPAConfig.IDENTIFIER.IDENTIFICATIVO_PSP,
      identificativoIntermediarioPSP:
        pagoPAConfig.IDENTIFIER.IDENTIFICATIVO_INTERMEDIARIO_PSP,
      identificativoCanale: pagoPAConfig.IDENTIFIER.IDENTIFICATIVO_CANALE,
      password: pagoPAConfig.IDENTIFIER.PASSWORD,
      codiceContestoPagamento,
      codificaInfrastrutturaPSP: codificaInfrastrutturaPSPEnum.QR_CODE,
      codiceIdRPT
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
  const datiPagamentoPA = iNodoVerificaRPTOutput.datiPagamentoPA;
  return PaymentRequestsGetResponse.decode({
    importoSingoloVersamento: datiPagamentoPA.importoSingoloVersamento * 100,
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
    spezzoniCausaleVersamento: getSpezzoniCausaleVersamentoForController(
      datiPagamentoPA.spezzoniCausaleVersamento
    )
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
    const codiceIdRPT = getCodiceIdRpt(paymentActivationsPostRequest.rptId);
    return right({
      identificativoPSP: pagoPAConfig.IDENTIFIER.IDENTIFICATIVO_PSP,
      identificativoIntermediarioPSP:
        pagoPAConfig.IDENTIFIER.IDENTIFICATIVO_INTERMEDIARIO_PSP,
      identificativoCanale: pagoPAConfig.IDENTIFIER.IDENTIFICATIVO_CANALE,
      password: pagoPAConfig.IDENTIFIER.PASSWORD,
      codiceContestoPagamento:
        paymentActivationsPostRequest.codiceContestoPagamento,
      identificativoIntermediarioPSPPagamento:
        pagoPAConfig.IDENTIFIER.IDENTIFICATIVO_INTERMEDIARIO_PSP,
      identificativoCanalePagamento:
        pagoPAConfig.IDENTIFIER.IDENTIFICATIVO_CANALE,
      codificaInfrastrutturaPSP: codificaInfrastrutturaPSPEnum.QR_CODE,
      codiceIdRPT,
      datiPagamentoPSP: {
        importoSingoloVersamento:
          paymentActivationsPostRequest.importoSingoloVersamento / 100
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
  const datiPagamentoPA = iNodoAttivaRPTOutput.datiPagamentoPA;

  return PaymentActivationsPostResponse.decode({
    importoSingoloVersamento: datiPagamentoPA.importoSingoloVersamento * 100,
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
    spezzoniCausaleVersamento: getSpezzoniCausaleVersamentoForController(
      datiPagamentoPA.spezzoniCausaleVersamento
    )
  });
}

/**
 * Define a IcodiceIdRPT object to send to PagoPA Services, containing payment information
 * Ask the pagopa service administrator or read documentation from RptId definition
 * @param {RptId} rptId - Payment information provided by BackendApp
 * @return {PPTPortTypes.IcodiceIdRPT} The result generated for PagoPa
 */
function getCodiceIdRpt(rptId: RptId): PPTPortTypes.IcodiceIdRPT {
  switch (rptId.paymentNoticeNumber.auxDigit) {
    case "0":
      return {
        CF: rptId.organizationFiscalCode,
        AuxDigit: rptId.paymentNoticeNumber.auxDigit,
        CodStazPA: rptId.paymentNoticeNumber.applicationCode,
        CodIUV: rptId.paymentNoticeNumber.iuv13
      };
    case "1":
      return {
        CF: rptId.organizationFiscalCode,
        AuxDigit: rptId.paymentNoticeNumber.auxDigit,
        CodIUV: rptId.paymentNoticeNumber.iuv17
      };
    case "2":
      return {
        CF: rptId.organizationFiscalCode,
        AuxDigit: rptId.paymentNoticeNumber.auxDigit,
        CodIUV: rptId.paymentNoticeNumber.iuv15
      };
    case "3":
      return {
        CF: rptId.organizationFiscalCode,
        AuxDigit: rptId.paymentNoticeNumber.auxDigit,
        CodIUV: rptId.paymentNoticeNumber.iuv13
      };
  }
}

/**
 * Provide SpezzoniCausaleVersamento element for BackendApp
 * parsing the SpezzoniCausaleVersamento element provided by PagoPaProxy
 */
function getSpezzoniCausaleVersamentoForController(
  spezzoniCausaleVersamento: ReadonlyArray<
    PPTPortTypes.IspezzoniCausaleVersamento
  >
): ReadonlyArray<PPTPortTypes.IspezzoniCausaleVersamento> | undefined {
  if (spezzoniCausaleVersamento === undefined) {
    return undefined;
  }
  return spezzoniCausaleVersamento.map(
    (value: PPTPortTypes.IspezzoniCausaleVersamento) => {
      return {
        spezzoneCausaleVersamento: value.spezzoneCausaleVersamento,
        spezzoneStrutturatoCausaleVersamento: {
          causaleSpezzone:
            value.spezzoneStrutturatoCausaleVersamento.causaleSpezzone,
          importoSpezzone:
            value.spezzoneStrutturatoCausaleVersamento.importoSpezzone * 100
        }
      };
    }
  );
}
