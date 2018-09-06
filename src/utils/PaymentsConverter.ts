/**
 * Payments Converter
 * Data Converter for Payments Request\Responses between PagoPA and BackendAPP types
 */

import { Either, left, right } from "fp-ts/lib/Either";
import { Validation } from "io-ts";
import { RptId } from "italia-ts-commons/lib/pagopa";
import { PagoPAConfig } from "../Configuration";
import { CodiceContestoPagamento } from "../types/api/CodiceContestoPagamento";
import { PaymentActivationsPostRequest } from "../types/api/PaymentActivationsPostRequest";
import { PaymentActivationsPostResponse } from "../types/api/PaymentActivationsPostResponse";
import { PaymentRequestsGetResponse } from "../types/api/PaymentRequestsGetResponse";
import { SpezzoniCausaleVersamento } from "../types/api/SpezzoniCausaleVersamento";
import { ctSpezzoneStrutturatoCausaleVersamento_ppt } from "../types/pagopa_api/yaml-to-ts/ctSpezzoneStrutturatoCausaleVersamento_ppt";
import { ctSpezzoniCausaleVersamento_ppt } from "../types/pagopa_api/yaml-to-ts/ctSpezzoniCausaleVersamento_ppt";
import { esitoNodoAttivaRPTRisposta_ppt } from "../types/pagopa_api/yaml-to-ts/esitoNodoAttivaRPTRisposta_ppt";
import { esitoNodoVerificaRPTRisposta_ppt } from "../types/pagopa_api/yaml-to-ts/esitoNodoVerificaRPTRisposta_ppt";
import { nodoAttivaRPT_ppt } from "../types/pagopa_api/yaml-to-ts/nodoAttivaRPT_ppt";
import { nodoTipoCodiceIdRPT_ppt } from "../types/pagopa_api/yaml-to-ts/nodoTipoCodiceIdRPT_ppt";
import { nodoVerificaRPT_ppt } from "../types/pagopa_api/yaml-to-ts/nodoVerificaRPT_ppt";
import { stText35_ppt } from "../types/pagopa_api/yaml-to-ts/stText35_ppt";
// tslint:disable:no-duplicate-string

/**
 * Define NodoVerificaRPTInput (PagoPA request) using information provided by BackendApp
 * @param {PagoPAConfig} PagoPAConfig - PagoPA config, containing static information to put into response
 * @param {RptId} rptId - Unique identifier for payment (fiscalCode + numeroAvviso)
 * @param {CodiceContestoPagamento} codiceContestoPagamento - Transaction Identifier to put into response
 * @return {Either<Error, NodoVerificaRPTInput>} Converted object
 */
export function getNodoVerificaRPTInput(
  pagoPAConfig: PagoPAConfig,
  rptId: RptId,
  codiceContestoPagamento: CodiceContestoPagamento
): Either<Error, nodoVerificaRPT_ppt> {
  // TODO: [#158209998] Remove try\catch and replace it with decode when io-ts types will be ready
  try {
    const codiceContestoPagamentoApi = getCodiceContestoPagamentoForPagoPaApi(
      codiceContestoPagamento
    );
    const codiceIdRPT = getCodiceIdRpt(rptId);
    return right({
      identificativoPSP: pagoPAConfig.IDENTIFIER.IDENTIFICATIVO_PSP,
      identificativoIntermediarioPSP:
        pagoPAConfig.IDENTIFIER.IDENTIFICATIVO_INTERMEDIARIO_PSP,
      identificativoCanale: pagoPAConfig.IDENTIFIER.IDENTIFICATIVO_CANALE,
      password: pagoPAConfig.IDENTIFIER.PASSWORD,
      codiceContestoPagamento: codiceContestoPagamentoApi,
      codificaInfrastrutturaPSP: "QR-CODE",
      codiceIdRPT
    });
  } catch (exception) {
    return left(Error(exception));
  }
}

/**
 * Convert esitoNodoVerificaRPTRisposta_ppt (PagoPA response) to PaymentRequestsGetResponse (BackendApp response)
 * @param {esitoNodoVerificaRPTRisposta_ppt} esitoNodoVerificaRPTRisposta - Message to convert
 * @param {CodiceContestoPagamento} codiceContestoPagamento - Transaction Identifier to put into response
 * @return {Validation<PaymentRequestsGetResponse>} Converted object
 */
export function getPaymentRequestsGetResponse(
  esitoNodoVerificaRPTRisposta: esitoNodoVerificaRPTRisposta_ppt,
  codiceContestoPagamento: CodiceContestoPagamento
): Validation<PaymentRequestsGetResponse> {
  const datiPagamentoPA = esitoNodoVerificaRPTRisposta.datiPagamentoPA;
  const codiceContestoPagamentoApi = getCodiceContestoPagamentoForPagoPaApi(
    codiceContestoPagamento
  );
  return PaymentRequestsGetResponse.decode({
    importoSingoloVersamento: datiPagamentoPA.importoSingoloVersamento * 100,
    codiceContestoPagamento: codiceContestoPagamentoApi,
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
 * Convert PaymentActivationsPostRequest (BackendApp request) to nodoAttivaRPT_ppt (PagoPA request)
 * @param {PagoPAConfig} PagoPAConfig - PagoPA config, containing static information to put into response
 * @param {PaymentActivationsPostRequest} paymentActivationsPostRequest - Message to convert
 * @return {Either<Error, nodoAttivaRPT_ppt>} Converted object
 */
export function getNodoAttivaRPTInput(
  pagoPAConfig: PagoPAConfig,
  paymentActivationsPostRequest: PaymentActivationsPostRequest
): Either<Error, nodoAttivaRPT_ppt> {
  // TODO: [#158209998] Remove try\catch and replace it with decode when io-ts types will be ready
  try {
    const codiceIdRPT = getCodiceIdRpt(paymentActivationsPostRequest.rptId);
    const codiceContestoPagamentoApi = getCodiceContestoPagamentoForPagoPaApi(
      paymentActivationsPostRequest.codiceContestoPagamento
    );
    return right({
      identificativoPSP: pagoPAConfig.IDENTIFIER.IDENTIFICATIVO_PSP,
      identificativoIntermediarioPSP:
        pagoPAConfig.IDENTIFIER.IDENTIFICATIVO_INTERMEDIARIO_PSP,
      identificativoCanale: pagoPAConfig.IDENTIFIER.IDENTIFICATIVO_CANALE,
      password: pagoPAConfig.IDENTIFIER.PASSWORD,
      codiceContestoPagamento: codiceContestoPagamentoApi,
      identificativoIntermediarioPSPPagamento:
        pagoPAConfig.IDENTIFIER.IDENTIFICATIVO_INTERMEDIARIO_PSP,
      identificativoCanalePagamento:
        pagoPAConfig.IDENTIFIER.IDENTIFICATIVO_CANALE,
      codificaInfrastrutturaPSP: "QR-CODE",
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
 * Convert esitoNodoAttivaRPTRisposta_ppt (PagoPA response) to PaymentActivationsPostResponse (BackendApp response)
 * @param {esitoNodoAttivaRPTRisposta_ppt} esitoNodoAttivaRPTRisposta - Message to convert
 * @return {Validation<PaymentActivationsPostResponse>} Converted object
 */
export function getPaymentActivationsPostResponse(
  esitoNodoAttivaRPTRisposta: esitoNodoAttivaRPTRisposta_ppt
): Validation<PaymentActivationsPostResponse> {
  const datiPagamentoPA = esitoNodoAttivaRPTRisposta.datiPagamentoPA;
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
 * Define a nodoTipoCodiceIdRPT_ppt object to send to PagoPA Services, containing payment information
 * Ask the pagopa service administrator or read documentation from RptId definition
 * @param {RptId} rptId - Payment information provided by BackendApp
 * @return {nodoTipoCodiceIdRPT_ppt} The result generated for PagoPa
 */
function getCodiceIdRpt(rptId: RptId): nodoTipoCodiceIdRPT_ppt {
  switch (rptId.paymentNoticeNumber.auxDigit) {
    case "0":
      return {
        "qrc:QrCode": {
          "qrc:CF": rptId.organizationFiscalCode,
          "qrc:CodStazPA": rptId.paymentNoticeNumber.applicationCode,
          "qrc:AuxDigit": rptId.paymentNoticeNumber.auxDigit,
          "qrc:CodIUV": rptId.paymentNoticeNumber.iuv13
        }
      };
    case "1":
      return {
        "qrc:QrCode": {
          "qrc:CF": rptId.organizationFiscalCode,
          "qrc:AuxDigit": rptId.paymentNoticeNumber.auxDigit,
          "qrc:CodIUV": rptId.paymentNoticeNumber.iuv17
        }
      };
    case "2":
      return {
        "qrc:QrCode": {
          "qrc:CF": rptId.organizationFiscalCode,
          "qrc:AuxDigit": rptId.paymentNoticeNumber.auxDigit,
          "qrc:CodIUV": rptId.paymentNoticeNumber.iuv15
        }
      };
    case "3":
      return {
        "qrc:QrCode": {
          "qrc:CF": rptId.organizationFiscalCode,
          "qrc:AuxDigit": rptId.paymentNoticeNumber.auxDigit,
          "qrc:CodIUV": rptId.paymentNoticeNumber.iuv13
        }
      };
  }
}

/**
 * Provide SpezzoniCausaleVersamento element for BackendApp
 * parsing the SpezzoniCausaleVersamento element provided by PagoPaProxy
 */
export function getSpezzoniCausaleVersamentoForController(
  spezzoniCausaleVersamento: ctSpezzoniCausaleVersamento_ppt
): SpezzoniCausaleVersamento | undefined {
  // Content is an array of spezzoniCausaleVersamento
  if (
    spezzoniCausaleVersamento !== undefined &&
    spezzoniCausaleVersamento.spezzoniCausaleVersamento !== undefined
  ) {
    return spezzoniCausaleVersamento.spezzoniCausaleVersamento.map(
      (value: stText35_ppt) => {
        return value;
      }
    );
  }

  // Content is an array of spezzoniStrutturatoCausaleVersamento
  if (
    spezzoniCausaleVersamento !== undefined &&
    spezzoniCausaleVersamento.spezzoniStrutturatoCausaleVersamento !== undefined
  ) {
    return spezzoniCausaleVersamento.spezzoniStrutturatoCausaleVersamento.map(
      (value: ctSpezzoneStrutturatoCausaleVersamento_ppt) => {
        return {
          causaleSpezzone: value.causaleSpezzone,
          importoSpezzone: value.importoSpezzone * 100
        };
      }
    );
  }
  return undefined;
}

/**
 * Provide CodiceContestoPagamento element for PagoPa API
 * parsing the CodiceContestoPagamento element provided by PagoPa Backend
 */
export function getCodiceContestoPagamentoForPagoPaApi(
  codiceContestoPagamento: CodiceContestoPagamento
): stText35_ppt {
  return stText35_ppt.decode(codiceContestoPagamento).value as stText35_ppt; // tslint:disable-line
}
