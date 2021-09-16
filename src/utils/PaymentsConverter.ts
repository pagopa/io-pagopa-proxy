/**
 * Payments Converter
 * Data Converter for Payments Request\Responses between PagoPA and BackendAPP types
 */

import { Either, isRight, left, right } from "fp-ts/lib/Either";
import * as t from "io-ts";
import {
  PaymentNoticeNumber,
  RptId,
  RptIdFromString
} from "italia-pagopa-commons/lib/pagopa";
import { CodiceContestoPagamento } from "../../generated/api/CodiceContestoPagamento";
import { ImportoEuroCents } from "../../generated/api/ImportoEuroCents";
import { PaymentActivationsPostRequest } from "../../generated/api/PaymentActivationsPostRequest";
import { PaymentActivationsPostResponse } from "../../generated/api/PaymentActivationsPostResponse";
import { PaymentRequestsGetResponse } from "../../generated/api/PaymentRequestsGetResponse";
import { activateIOPaymentReq_nfpsp } from "../../generated/nodeNm3io/activateIOPaymentReq_nfpsp";
import { activateIOPaymentRes_nfpsp } from "../../generated/nodeNm3io/activateIOPaymentRes_nfpsp";
import { ctPaymentOptionDescription_nfpsp } from "../../generated/nodeNm3psp/ctPaymentOptionDescription_nfpsp";
import { verifyPaymentNoticeReq_nfpsp } from "../../generated/nodeNm3psp/verifyPaymentNoticeReq_nfpsp";
import { verifyPaymentNoticeRes_nfpsp } from "../../generated/nodeNm3psp/verifyPaymentNoticeRes_nfpsp";
import { ctEnteBeneficiario_pay_i_unqual } from "../../generated/PagamentiTelematiciPspNodoservice/ctEnteBeneficiario_pay_i_unqual";
import { esitoNodoAttivaRPTRisposta_ppt } from "../../generated/PagamentiTelematiciPspNodoservice/esitoNodoAttivaRPTRisposta_ppt";
import { esitoNodoVerificaRPTRisposta_ppt } from "../../generated/PagamentiTelematiciPspNodoservice/esitoNodoVerificaRPTRisposta_ppt";
import { nodoAttivaRPT_ppt } from "../../generated/PagamentiTelematiciPspNodoservice/nodoAttivaRPT_ppt";
import { nodoTipoCodiceIdRPT_ppt } from "../../generated/PagamentiTelematiciPspNodoservice/nodoTipoCodiceIdRPT_ppt";
import { nodoTipoDatiPagamentoPA_ppt } from "../../generated/PagamentiTelematiciPspNodoservice/nodoTipoDatiPagamentoPA_ppt";
import { nodoVerificaRPT_ppt } from "../../generated/PagamentiTelematiciPspNodoservice/nodoVerificaRPT_ppt";

import { stText140_ppt } from "../../generated/PagamentiTelematiciPspNodoservice/stText140_ppt";
import { stText35_ppt } from "../../generated/PagamentiTelematiciPspNodoservice/stText35_ppt";
import { PagoPAConfig } from "../Configuration";
import { exactConvertToCents } from "./money";
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

export function getNodoVerifyPaymentNoticeInput(
  pagoPAConfig: PagoPAConfig,
  rptId: RptId
): Either<Error, verifyPaymentNoticeReq_nfpsp> {
  return verifyPaymentNoticeReq_nfpsp
    .decode({
      idPSP: pagoPAConfig.IDENTIFIER.IDENTIFICATIVO_PSP,
      idBrokerPSP: pagoPAConfig.IDENTIFIER.IDENTIFICATIVO_INTERMEDIARIO_PSP,
      idChannel: pagoPAConfig.IDENTIFIER.IDENTIFICATIVO_CANALE,
      password: pagoPAConfig.IDENTIFIER.PASSWORD,
      qrCode: {
        fiscalCode: rptId.organizationFiscalCode,
        noticeNumber: getPaymentNoticeNumberAsString(rptId.paymentNoticeNumber)
      }
    })
    .bimap(() => Error("Decode Error NodoVerifyPaymentNotice"), t.identity);
}

export function getNodoActivateIOPaymentInput(
  pagoPAConfig: PagoPAConfig,
  rptId: RptId,
  amount: ImportoEuroCents
): Either<Error, activateIOPaymentReq_nfpsp> {
  return activateIOPaymentReq_nfpsp
    .decode({
      idPSP: pagoPAConfig.IDENTIFIER.IDENTIFICATIVO_PSP,
      idBrokerPSP: pagoPAConfig.IDENTIFIER.IDENTIFICATIVO_INTERMEDIARIO_PSP,
      idChannel: pagoPAConfig.IDENTIFIER.IDENTIFICATIVO_CANALE,
      password: pagoPAConfig.IDENTIFIER.PASSWORD,
      qrCode: {
        fiscalCode: rptId.organizationFiscalCode,
        noticeNumber: getPaymentNoticeNumberAsString(rptId.paymentNoticeNumber)
      },
      amount: amount / 100
    })
    .bimap(() => Error("Decode Error NodoActivatePaymentNotice"), t.identity);
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
): t.Validation<PaymentRequestsGetResponse> {
  const datiPagamentoPA = esitoNodoVerificaRPTRisposta.datiPagamentoPA;
  const codiceContestoPagamentoApi = getCodiceContestoPagamentoForPagoPaApi(
    codiceContestoPagamento
  );

  const response = datiPagamentoPA
    ? {
        importoSingoloVersamento: exactConvertToCents(
          datiPagamentoPA.importoSingoloVersamento
        ),
        codiceContestoPagamento: codiceContestoPagamentoApi,
        ibanAccredito: datiPagamentoPA.ibanAccredito,
        causaleVersamento: getCausaleVersamentoForController(datiPagamentoPA),
        enteBeneficiario: getEnteBeneficiario(datiPagamentoPA.enteBeneficiario)
      }
    : undefined;

  return PaymentRequestsGetResponse.decode(response);
}

/* tslint:disable */
export function getEnteBeneficiario(
  enteBeneficiarioIn: ctEnteBeneficiario_pay_i_unqual | undefined
): ctEnteBeneficiario_pay_i_unqual | undefined {
  const enteBeneficiarioOut = enteBeneficiarioIn
    ? {
        identificativoUnivocoBeneficiario:
          enteBeneficiarioIn.identificativoUnivocoBeneficiario
            .codiceIdentificativoUnivoco,
        denominazioneBeneficiario: enteBeneficiarioIn.denominazioneBeneficiario
          ? enteBeneficiarioIn.denominazioneBeneficiario
          : undefined,
        codiceUnitOperBeneficiario: enteBeneficiarioIn.codiceUnitOperBeneficiario
          ? enteBeneficiarioIn.codiceUnitOperBeneficiario
          : undefined,
        denomUnitOperBeneficiario: enteBeneficiarioIn.denomUnitOperBeneficiario
          ? enteBeneficiarioIn.denomUnitOperBeneficiario
          : undefined,
        indirizzoBeneficiario: enteBeneficiarioIn.indirizzoBeneficiario
          ? enteBeneficiarioIn.indirizzoBeneficiario
          : undefined,
        civicoBeneficiario: enteBeneficiarioIn.civicoBeneficiario
          ? enteBeneficiarioIn.civicoBeneficiario
          : undefined,
        capBeneficiario: enteBeneficiarioIn.capBeneficiario
          ? enteBeneficiarioIn.capBeneficiario
          : undefined,
        localitaBeneficiario: enteBeneficiarioIn.localitaBeneficiario
          ? enteBeneficiarioIn.localitaBeneficiario
          : undefined,
        provinciaBeneficiario: enteBeneficiarioIn.provinciaBeneficiario
          ? enteBeneficiarioIn.provinciaBeneficiario
          : undefined,
        nazioneBeneficiario: enteBeneficiarioIn.nazioneBeneficiario
          ? enteBeneficiarioIn.nazioneBeneficiario
          : undefined
      }
    : undefined;
  return (enteBeneficiarioOut as unknown) as ctEnteBeneficiario_pay_i_unqual;
}

export function getPaymentRequestsGetResponseNm3(
  verifyPaymentNoticeResponse: verifyPaymentNoticeRes_nfpsp,
  codiceContestoPagamento: CodiceContestoPagamento
): t.Validation<PaymentRequestsGetResponse> {
  const codiceContestoPagamentoApi = getCodiceContestoPagamentoForPagoPaApi(
    codiceContestoPagamento
  );

  const paymentOptionDescription: ctPaymentOptionDescription_nfpsp =
    verifyPaymentNoticeResponse.paymentList &&
    Array.isArray(
      verifyPaymentNoticeResponse.paymentList.paymentOptionDescription
    )
      ? verifyPaymentNoticeResponse.paymentList.paymentOptionDescription[0]
      : verifyPaymentNoticeResponse.paymentList
        ? verifyPaymentNoticeResponse.paymentList.paymentOptionDescription
        : undefined;

  return PaymentRequestsGetResponse.decode(
    paymentOptionDescription
      ? {
          importoSingoloVersamento: exactConvertToCents(
            paymentOptionDescription.amount
          ),
          codiceContestoPagamento: codiceContestoPagamentoApi,
          causaleVersamento: paymentOptionDescription.paymentNote,
          enteBeneficiario: {
            identificativoUnivocoBeneficiario:
              verifyPaymentNoticeResponse.fiscalCodePA,
            denominazioneBeneficiario: verifyPaymentNoticeResponse.companyName,
            codiceUnitOperBeneficiario: verifyPaymentNoticeResponse.officeName,
            denomUnitOperBeneficiario: verifyPaymentNoticeResponse.officeName
          }
        }
      : undefined
  );
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
    const rptId = RptIdFromString.decode(
      paymentActivationsPostRequest.rptId
    ).getOrElseL(_ => {
      throw Error("Cannot parse rptId");
    });
    const codiceIdRPT = getCodiceIdRpt(rptId);
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
        pagoPAConfig.IDENTIFIER.IDENTIFICATIVO_CANALE_PAGAMENTO,
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
): t.Validation<PaymentActivationsPostResponse> {
  const datiPagamentoPA = esitoNodoAttivaRPTRisposta.datiPagamentoPA;

  const response =
    datiPagamentoPA !== undefined
      ? {
          importoSingoloVersamento: exactConvertToCents(
            datiPagamentoPA.importoSingoloVersamento
          ),
          ibanAccredito: datiPagamentoPA.ibanAccredito,
          causaleVersamento: datiPagamentoPA.causaleVersamento,
          enteBeneficiario: datiPagamentoPA.enteBeneficiario
            ? {
                identificativoUnivocoBeneficiario:
                  datiPagamentoPA.enteBeneficiario
                    .identificativoUnivocoBeneficiario
                    .codiceIdentificativoUnivoco,
                denominazioneBeneficiario:
                  datiPagamentoPA.enteBeneficiario.denominazioneBeneficiario,
                codiceUnitOperBeneficiario:
                  datiPagamentoPA.enteBeneficiario.codiceUnitOperBeneficiario,
                denomUnitOperBeneficiario:
                  datiPagamentoPA.enteBeneficiario.denomUnitOperBeneficiario,
                indirizzoBeneficiario:
                  datiPagamentoPA.enteBeneficiario.indirizzoBeneficiario,
                civicoBeneficiario:
                  datiPagamentoPA.enteBeneficiario.civicoBeneficiario,
                capBeneficiario:
                  datiPagamentoPA.enteBeneficiario.capBeneficiario,
                localitaBeneficiario:
                  datiPagamentoPA.enteBeneficiario.localitaBeneficiario,
                provinciaBeneficiario:
                  datiPagamentoPA.enteBeneficiario.provinciaBeneficiario,
                nazioneBeneficiario:
                  datiPagamentoPA.enteBeneficiario.nazioneBeneficiario
              }
            : undefined
        }
      : undefined;

  return PaymentActivationsPostResponse.decode(response);
}

export function getActivateIOPaymentResponse(
  activateIOPaymentRes: activateIOPaymentRes_nfpsp
): t.Validation<PaymentActivationsPostResponse> {
  const response =
    activateIOPaymentRes !== undefined
      ? {
          importoSingoloVersamento: activateIOPaymentRes.totalAmount
            ? exactConvertToCents(activateIOPaymentRes.totalAmount)
            : undefined,
          causaleVersamento: activateIOPaymentRes.paymentDescription
            ? activateIOPaymentRes.paymentDescription
            : undefined,
          enteBeneficiario: {
            identificativoUnivocoBeneficiario: activateIOPaymentRes.fiscalCodePA
              ? activateIOPaymentRes.fiscalCodePA
              : undefined,
            denominazioneBeneficiario: activateIOPaymentRes.officeName
              ? activateIOPaymentRes.officeName
              : undefined
          }
        }
      : undefined;

  return PaymentActivationsPostResponse.decode(response);
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
          "qrc:CodIUV": [
            rptId.paymentNoticeNumber.iuv13,
            rptId.paymentNoticeNumber.checkDigit
          ].join("")
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
          "qrc:CodIUV": [
            rptId.paymentNoticeNumber.iuv15,
            rptId.paymentNoticeNumber.checkDigit
          ].join("")
        }
      };
    case "3":
      return {
        "qrc:QrCode": {
          "qrc:CF": rptId.organizationFiscalCode,
          "qrc:AuxDigit": rptId.paymentNoticeNumber.auxDigit,
          "qrc:CodIUV": [
            rptId.paymentNoticeNumber.segregationCode,
            rptId.paymentNoticeNumber.iuv13,
            rptId.paymentNoticeNumber.checkDigit
          ].join("")
        }
      };
  }
}

/**
 * Extract causaleVersamento from esitoNodoVerificaRPTRisposta_ppt
 * @param {esitoNodoVerificaRPTRisposta_ppt} datiPagamentoPA - Payment information provided by BackendApp
 * @return {stText140_ppt | undefined} The causaleVersamento value
 */
function getCausaleVersamentoForController(
  datiPagamentoPA: nodoTipoDatiPagamentoPA_ppt
): stText140_ppt | undefined {
  if (datiPagamentoPA.causaleVersamento !== undefined) {
    return datiPagamentoPA.causaleVersamento;
  }
  if (datiPagamentoPA.spezzoniCausaleVersamento === undefined) {
    return undefined;
  }

  if (
    datiPagamentoPA.spezzoniCausaleVersamento.spezzoneCausaleVersamento !==
    undefined
  ) {
    const spezzoneCausaleVersamento =
      datiPagamentoPA.spezzoniCausaleVersamento.spezzoneCausaleVersamento;
    const spezzoneCausaleVersamentoOrError = stText140_ppt.decode(
      spezzoneCausaleVersamento
    );
    if (isRight(spezzoneCausaleVersamentoOrError)) {
      return spezzoneCausaleVersamentoOrError.value;
    }
    if (spezzoneCausaleVersamento instanceof Array) {
      const firstSpezzoneCausaleVersamentoOrError = stText140_ppt.decode(
        spezzoneCausaleVersamento[0]
      );
      if (isRight(firstSpezzoneCausaleVersamentoOrError)) {
        return firstSpezzoneCausaleVersamentoOrError.value;
      }
    }
  }

  const spezzoneStrutturatoCausaleVersamento =
    datiPagamentoPA.spezzoniCausaleVersamento
      .spezzoneStrutturatoCausaleVersamento;
  if (
    datiPagamentoPA.spezzoniCausaleVersamento
      .spezzoneStrutturatoCausaleVersamento !== undefined
  ) {
    const spezzoneStrutturato =
      datiPagamentoPA.spezzoniCausaleVersamento
        .spezzoneStrutturatoCausaleVersamento instanceof Array
        ? spezzoneStrutturatoCausaleVersamento[0]
        : datiPagamentoPA.spezzoniCausaleVersamento
            .spezzoneStrutturatoCausaleVersamento;
    if (spezzoneStrutturato.causaleSpezzone !== undefined) {
      return stText140_ppt.decode(spezzoneStrutturato.causaleSpezzone)
        .value as stText140_ppt; // tslint:disable-line
    }
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
/**
 * Return a paymentNoticeNumber as string according to
 * https://pagopa.atlassian.net/wiki/spaces/ISS/pages/296911713/Come+ricostruire+un+Numero+Avviso+NAV
 * @param paymentNoticeNumber as PaymentNoticeNumber
 * @returns paymentNoticeNumber as string
 */
function getPaymentNoticeNumberAsString(
  paymentNoticeNumber: PaymentNoticeNumber
): string {
  switch (paymentNoticeNumber.auxDigit) {
    case "0":
      return `${paymentNoticeNumber.auxDigit}${
        paymentNoticeNumber.applicationCode
      }${paymentNoticeNumber.iuv13}${paymentNoticeNumber.checkDigit}`;
    case "1":
      return `${paymentNoticeNumber.auxDigit}${paymentNoticeNumber.iuv17}`;
    case "2":
      return `${paymentNoticeNumber.auxDigit}${paymentNoticeNumber.iuv15}${
        paymentNoticeNumber.checkDigit
      }`;
    case "3":
      return `${paymentNoticeNumber.auxDigit}${
        paymentNoticeNumber.segregationCode
      }${paymentNoticeNumber.iuv13}${paymentNoticeNumber.checkDigit}`;
  }
}
