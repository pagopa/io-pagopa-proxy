/* eslint-disable sort-keys */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
/**
 * Payments Converter
 * Data Converter for Payments Request\Responses between PagoPA and BackendAPP types
 */

import * as E from "fp-ts/lib/Either";
import * as t from "io-ts";
import { pipe } from "fp-ts/lib/function";
import { CodiceContestoPagamento } from "../../generated/api/CodiceContestoPagamento";
import { ImportoEuroCents } from "../../generated/api/ImportoEuroCents";
import { PaymentActivationsPostRequest } from "../../generated/api/PaymentActivationsPostRequest";
import { PaymentActivationsPostResponse } from "../../generated/api/PaymentActivationsPostResponse";
import { PaymentRequestsGetResponse } from "../../generated/api/PaymentRequestsGetResponse";
import { activateIOPaymentReq_element_nfpsp } from "../../generated/nodeNm3io/activateIOPaymentReq_element_nfpsp";
import { activateIOPaymentRes_element_nfpsp } from "../../generated/nodeNm3io/activateIOPaymentRes_element_nfpsp";
import { ctPaymentOptionDescription_type_nfpsp } from "../../generated/nodeNm3psp/ctPaymentOptionDescription_type_nfpsp";
import { verifyPaymentNoticeReq_element_nfpsp } from "../../generated/nodeNm3psp/verifyPaymentNoticeReq_element_nfpsp";
import { verifyPaymentNoticeRes_element_nfpsp } from "../../generated/nodeNm3psp/verifyPaymentNoticeRes_element_nfpsp";
import { ctEnteBeneficiario_type_pay_i_unqual } from "../../generated/PagamentiTelematiciPspNodoservice/ctEnteBeneficiario_type_pay_i_unqual";
import { esitoNodoAttivaRPTRisposta_type_ppt } from "../../generated/PagamentiTelematiciPspNodoservice/esitoNodoAttivaRPTRisposta_type_ppt";
import { esitoNodoVerificaRPTRisposta_type_ppt } from "../../generated/PagamentiTelematiciPspNodoservice/esitoNodoVerificaRPTRisposta_type_ppt";
import { nodoAttivaRPT_element_ppt } from "../../generated/PagamentiTelematiciPspNodoservice/nodoAttivaRPT_element_ppt";
import { nodoTipoCodiceIdRPT_type_ppt } from "../../generated/PagamentiTelematiciPspNodoservice/nodoTipoCodiceIdRPT_type_ppt";
import { nodoTipoDatiPagamentoPA_type_ppt } from "../../generated/PagamentiTelematiciPspNodoservice/nodoTipoDatiPagamentoPA_type_ppt";
import { nodoVerificaRPT_element_ppt } from "../../generated/PagamentiTelematiciPspNodoservice/nodoVerificaRPT_element_ppt";

import { stText140_type_ppt } from "../../generated/PagamentiTelematiciPspNodoservice/stText140_type_ppt";
import { stText35_type_ppt } from "../../generated/PagamentiTelematiciPspNodoservice/stText35_type_ppt";
import { NodeClientConfig } from "../Configuration";
import { exactConvertToCents } from "./money";
import { PaymentNoticeNumber, RptId, RptIdFromString } from "./pagopa";

/**
 * Define NodoVerificaRPTInput (PagoPA request) using information provided by BackendApp
 *
 * @param {NonEmptyString} clientId - Client identifier used to fetch Node connection parameters
 * @param {NodeClientConfig} pagoPAConfig - PagoPA config, containing static information to put into response
 * @param {RptId} rptId - Unique identifier for payment (fiscalCode + numeroAvviso)
 * @param {CodiceContestoPagamento} codiceContestoPagamento - Transaction Identifier to put into response
 * @return {E.Either<Error, nodoVerificaRPT_element_ppt>} Converted object
 */
export function getNodoVerificaRPTInput(
  pagoPAConfig: NodeClientConfig,
  rptId: RptId,
  codiceContestoPagamento: CodiceContestoPagamento
): E.Either<Error, nodoVerificaRPT_element_ppt> {
  // TODO: [#158209998] Remove try\catch and replace it with decode when io-ts types will be ready
  try {
    const codiceContestoPagamentoApi = getCodiceContestoPagamentoForPagoPaApi(
      codiceContestoPagamento
    );
    const codiceIdRPT = getCodiceIdRpt(rptId);
    return E.right({
      identificativoPSP: pagoPAConfig.IDENTIFICATIVO_PSP,
      identificativoIntermediarioPSP:
        pagoPAConfig.IDENTIFICATIVO_INTERMEDIARIO_PSP,
      identificativoCanale: pagoPAConfig.IDENTIFICATIVO_CANALE,
      password: pagoPAConfig.PASSWORD,
      codiceContestoPagamento: codiceContestoPagamentoApi,
      codificaInfrastrutturaPSP: "QR-CODE",
      codiceIdRPT
    });
  } catch (exception) {
    return E.left(Error(exception));
  }
}

export function getNodoVerifyPaymentNoticeInput(
  pagoPAConfig: NodeClientConfig,
  rptId: RptId
): E.Either<Error, verifyPaymentNoticeReq_element_nfpsp> {
  return pipe(
    verifyPaymentNoticeReq_element_nfpsp.decode({
      idPSP: pagoPAConfig.IDENTIFICATIVO_PSP,
      idBrokerPSP: pagoPAConfig.IDENTIFICATIVO_INTERMEDIARIO_PSP,
      idChannel: pagoPAConfig.IDENTIFICATIVO_CANALE,
      password: pagoPAConfig.PASSWORD,
      qrCode: {
        fiscalCode: rptId.organizationFiscalCode,
        noticeNumber: getPaymentNoticeNumberAsString(rptId.paymentNoticeNumber)
      }
    }),
    E.bimap(() => Error("Decode Error NodoVerifyPaymentNotice"), t.identity)
  );
}

export function getNodoActivateIOPaymentInput(
  pagoPAConfig: NodeClientConfig,
  rptId: RptId,
  amount: ImportoEuroCents
): E.Either<Error, activateIOPaymentReq_element_nfpsp> {
  return pipe(
    activateIOPaymentReq_element_nfpsp.decode({
      idPSP: pagoPAConfig.IDENTIFICATIVO_PSP,
      idBrokerPSP: pagoPAConfig.IDENTIFICATIVO_INTERMEDIARIO_PSP,
      idChannel: pagoPAConfig.IDENTIFICATIVO_CANALE,
      password: pagoPAConfig.PASSWORD,
      qrCode: {
        fiscalCode: rptId.organizationFiscalCode,
        noticeNumber: getPaymentNoticeNumberAsString(rptId.paymentNoticeNumber)
      },
      amount: amount / 100
    }),
    E.bimap(() => Error("Decode Error NodoActivatePaymentNotice"), t.identity)
  );
}

/**
 * Convert esitoNodoVerificaRPTRisposta_type_ppt (PagoPA response) to PaymentRequestsGetResponse (BackendApp response)
 *
 * @param {esitoNodoVerificaRPTRisposta_type_ppt} esitoNodoVerificaRPTRisposta - Message to convert
 * @param {CodiceContestoPagamento} codiceContestoPagamento - Transaction Identifier to put into response
 * @return {Validation<PaymentRequestsGetResponse>} Converted object
 */
export function getPaymentRequestsGetResponse(
  esitoNodoVerificaRPTRisposta: esitoNodoVerificaRPTRisposta_type_ppt,
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

export function getEnteBeneficiario(
  enteBeneficiarioIn: ctEnteBeneficiario_type_pay_i_unqual | undefined
): ctEnteBeneficiario_type_pay_i_unqual | undefined {
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
  return (enteBeneficiarioOut as unknown) as ctEnteBeneficiario_type_pay_i_unqual;
}

export function getPaymentRequestsGetResponseNm3(
  verifyPaymentNoticeResponse: verifyPaymentNoticeRes_element_nfpsp,
  codiceContestoPagamento: CodiceContestoPagamento
): t.Validation<PaymentRequestsGetResponse> {
  const codiceContestoPagamentoApi = getCodiceContestoPagamentoForPagoPaApi(
    codiceContestoPagamento
  );

  const paymentOptionDescription: ctPaymentOptionDescription_type_nfpsp =
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
          causaleVersamento: verifyPaymentNoticeResponse.paymentDescription,
          enteBeneficiario: {
            identificativoUnivocoBeneficiario:
              verifyPaymentNoticeResponse.fiscalCodePA,
            denominazioneBeneficiario: verifyPaymentNoticeResponse.companyName?.substring(
              0,
              70
            ),
            denomUnitOperBeneficiario: verifyPaymentNoticeResponse.officeName
          },
          dueDate: paymentOptionDescription.dueDate
        }
      : undefined
  );
}
/**
 * Convert PaymentActivationsPostRequest (BackendApp request) to nodoAttivaRPT_element_ppt (PagoPA request)
 *
 * @param {string} clientId - Client identifier used to fetch Node connection parameters
 * @param {PagoPAConfig} pagoPAConfig - PagoPA config, containing static information to put into response
 * @param {PaymentActivationsPostRequest} paymentActivationsPostRequest - Message to convert
 * @return {Either<Error, nodoAttivaRPT_element_ppt>} Converted object
 */
export function getNodoAttivaRPTInput(
  pagoPAConfig: NodeClientConfig,
  paymentActivationsPostRequest: PaymentActivationsPostRequest
): E.Either<Error, nodoAttivaRPT_element_ppt> {
  const rptId = pipe(
    RptIdFromString.decode(paymentActivationsPostRequest.rptId),
    E.getOrElseW(_ => {
      throw Error("Cannot parse rptId");
    })
  );
  const codiceIdRPT = getCodiceIdRpt(rptId);
  const codiceContestoPagamentoApi = getCodiceContestoPagamentoForPagoPaApi(
    paymentActivationsPostRequest.codiceContestoPagamento
  );

  // Autogenerated type from wsdl definition can't be mapped correctly to `nodoAttivaRPT_element_ppt`
  // Because of that we force typing via a cast.
  return pipe(
    E.right({
      identificativoPSP: pagoPAConfig.IDENTIFICATIVO_PSP,
      identificativoIntermediarioPSP:
        pagoPAConfig.IDENTIFICATIVO_INTERMEDIARIO_PSP,
      identificativoCanale: pagoPAConfig.IDENTIFICATIVO_CANALE,
      password: pagoPAConfig.PASSWORD,
      codiceContestoPagamento: codiceContestoPagamentoApi,
      identificativoIntermediarioPSPPagamento:
        pagoPAConfig.IDENTIFICATIVO_INTERMEDIARIO_PSP,
      identificativoCanalePagamento:
        pagoPAConfig.IDENTIFICATIVO_CANALE_PAGAMENTO,
      codificaInfrastrutturaPSP: "QR-CODE",
      codiceIdRPT,
      datiPagamentoPSP: {
        importoSingoloVersamento:
          paymentActivationsPostRequest.importoSingoloVersamento / 100
      }
    } as nodoAttivaRPT_element_ppt),
    E.bimap(_ => Error("Cannot parse nodoAttivaRPT_element_ppt"), t.identity)
  );
}

/**
 * Convert esitoNodoAttivaRPTRisposta_type_ppt (PagoPA response) to PaymentActivationsPostResponse (BackendApp response)
 *
 * @param {esitoNodoAttivaRPTRisposta_type_ppt} esitoNodoAttivaRPTRisposta - Message to convert
 * @return {Validation<PaymentActivationsPostResponse>} Converted object
 */
export function getPaymentActivationsPostResponse(
  esitoNodoAttivaRPTRisposta: esitoNodoAttivaRPTRisposta_type_ppt
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
  activateIOPaymentRes: activateIOPaymentRes_element_nfpsp
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
          enteBeneficiario:
            activateIOPaymentRes.fiscalCodePA &&
            activateIOPaymentRes.companyName
              ? {
                  identificativoUnivocoBeneficiario:
                    activateIOPaymentRes.fiscalCodePA,
                  denominazioneBeneficiario: activateIOPaymentRes.companyName.substring(
                    0,
                    70
                  )
                }
              : undefined
        }
      : undefined;

  return PaymentActivationsPostResponse.decode(response);
}

/**
 * Define a nodoTipoCodiceIdRPT_type_ppt object to send to PagoPA Services, containing payment information
 * Ask the pagopa service administrator or read documentation from RptId definition
 *
 * @param {RptId} rptId - Payment information provided by BackendApp
 * @return {nodoTipoCodiceIdRPT_type_ppt} The result generated for PagoPa
 */
function getCodiceIdRpt(rptId: RptId): nodoTipoCodiceIdRPT_type_ppt {
  // eslint-disable-next-line default-case
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
 * Extract causaleVersamento from esitoNodoVerificaRPTRisposta_type_ppt
 *
 * @param {esitoNodoVerificaRPTRisposta_type_ppt} datiPagamentoPA - Payment information provided by BackendApp
 * @return {stText140_type_ppt | undefined} The causaleVersamento value
 */
function getCausaleVersamentoForController(
  datiPagamentoPA: nodoTipoDatiPagamentoPA_type_ppt
): stText140_type_ppt | undefined {
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
    const spezzoneCausaleVersamentoOrError = stText140_type_ppt.decode(
      spezzoneCausaleVersamento
    );
    if (E.isRight(spezzoneCausaleVersamentoOrError)) {
      return spezzoneCausaleVersamentoOrError.right;
    }
    if (spezzoneCausaleVersamento instanceof Array) {
      const firstSpezzoneCausaleVersamentoOrError = stText140_type_ppt.decode(
        spezzoneCausaleVersamento[0]
      );
      if (E.isRight(firstSpezzoneCausaleVersamentoOrError)) {
        return firstSpezzoneCausaleVersamentoOrError.right;
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
      return pipe(
        stText140_type_ppt.decode(spezzoneStrutturato.causaleSpezzone),
        E.getOrElseW(_ => {
          throw Error("Cannot parse causaleSpezzone as stText140_type_ppt");
        })
      );
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
): stText35_type_ppt {
  return pipe(
    stText35_type_ppt.decode(codiceContestoPagamento),
    E.getOrElseW(_ => {
      throw Error("Cannot parse causaleSpezzone as stText140_type_ppt");
    })
  );
}
/**
 * Return a paymentNoticeNumber as string according to
 * https://pagopa.atlassian.net/wiki/spaces/ISS/pages/296911713/Come+ricostruire+un+Numero+Avviso+NAV
 *
 * @param paymentNoticeNumber as PaymentNoticeNumber
 * @returns paymentNoticeNumber as string
 */
export function getPaymentNoticeNumberAsString(
  paymentNoticeNumber: PaymentNoticeNumber
): string {
  // eslint-disable-next-line default-case
  switch (paymentNoticeNumber.auxDigit) {
    case "0":
      return `${paymentNoticeNumber.auxDigit}${paymentNoticeNumber.applicationCode}${paymentNoticeNumber.iuv13}${paymentNoticeNumber.checkDigit}`;
    case "1":
      return `${paymentNoticeNumber.auxDigit}${paymentNoticeNumber.iuv17}`;
    case "2":
      return `${paymentNoticeNumber.auxDigit}${paymentNoticeNumber.iuv15}${paymentNoticeNumber.checkDigit}`;
    case "3":
      return `${paymentNoticeNumber.auxDigit}${paymentNoticeNumber.segregationCode}${paymentNoticeNumber.iuv13}${paymentNoticeNumber.checkDigit}`;
  }
}
