/**
 * Payments Converter
 * Data Converter for Payments Request\Responses
 */
import { CONFIG } from "../../Configuration";

import { Either, Left, Right } from "fp-ts/lib/Either";
import {
  IcdInfoWispInput,
  InodoAttivaRPTInput,
  InodoVerificaRPTInput,
  InodoVerificaRPTOutput
} from "italia-pagopa-api/dist/wsdl-lib/PagamentiTelematiciPspNodoservice/PPTPort";
import { ControllerError } from "../../enums/ControllerError";
import { PaymentsActivationRequest } from "../../types/controllers/PaymentsActivationRequest";
import { PaymentsCheckRequest } from "../../types/controllers/PaymentsCheckRequest";
import { PaymentsCheckResponse } from "../../types/controllers/PaymentsCheckResponse";
import { PaymentsStatusUpdateRequest } from "../../types/controllers/PaymentsStatusUpdateRequest";
import { generateCodiceContestoPagamento } from "./ConverterUtils";

// Convert PaymentsCheckRequest (controller) to PaymentsCheckRequestPagoPa (PagoPa API)
export function getPaymentsCheckRequestPagoPa(
  paymentsCheckRequest: PaymentsCheckRequest
): Either<Error, InodoVerificaRPTInput> {
  const errorOrCodiceContestoPagamento = generateCodiceContestoPagamento();
  if (errorOrCodiceContestoPagamento.isLeft()) {
    return new Left(errorOrCodiceContestoPagamento.value);
  }
  return new Right({
    identificativoPSP: CONFIG.PAGOPA.IDENTIFIER.IDENTIFICATIVO_PSP,
    identificativoIntermediarioPSP:
      CONFIG.PAGOPA.IDENTIFIER.IDENTIFICATIVO_INTERMEDIARIO_PSP,
    identificativoCanale: CONFIG.PAGOPA.IDENTIFIER.IDENTIFICATIVO_CANALE,
    password: CONFIG.PAGOPA.IDENTIFIER.TOKEN,
    codiceContestoPagamento: errorOrCodiceContestoPagamento.value,
    codificaInfrastrutturaPSP:
      CONFIG.PAGOPA.PAYMENTS.CODIFICA_INFRASTRUTTURA_PSP,
    codiceIdRPT: {
      CF: paymentsCheckRequest.codiceIdRPT.CF,
      AuxDigit: paymentsCheckRequest.codiceIdRPT.AuxDigit,
      CodStazPA: paymentsCheckRequest.codiceIdRPT.CodStazPA,
      CodIUV: paymentsCheckRequest.codiceIdRPT.CodIUV
    }
  });
}

// Convert PaymentsCheckResponsePagoPa (PagoPa API) to PaymentsCheckResponse (controller)
export function getPaymentsCheckResponse(
  iNodoVerificaRPTOutput: InodoVerificaRPTOutput
): Either<Error, PaymentsCheckResponse> {
  const errorOrPaymentCheckResponse = PaymentsCheckResponse.decode({
    importoSingoloVersamento:
      iNodoVerificaRPTOutput.nodoVerificaRPTRisposta.datiPagamentoPA
        .importoSingoloVersamento,
    ibanAccredito:
      iNodoVerificaRPTOutput.nodoVerificaRPTRisposta.datiPagamentoPA
        .ibanAccredito,
    causaleVersamento:
      iNodoVerificaRPTOutput.nodoVerificaRPTRisposta.datiPagamentoPA
        .causaleVersamento,
    enteBeneficiario: {
      codiceIdentificativoUnivoco:
        iNodoVerificaRPTOutput.nodoVerificaRPTRisposta.datiPagamentoPA
          .enteBeneficiario.identificativoUnivocoBeneficiario,
      denominazioneBeneficiario:
        iNodoVerificaRPTOutput.nodoVerificaRPTRisposta.datiPagamentoPA
          .enteBeneficiario.denominazioneBeneficiario,
      codiceUnitOperBeneficiario:
        iNodoVerificaRPTOutput.nodoVerificaRPTRisposta.datiPagamentoPA
          .enteBeneficiario.codiceUnitOperBeneficiario,
      denomUnitOperBeneficiario:
        iNodoVerificaRPTOutput.nodoVerificaRPTRisposta.datiPagamentoPA
          .enteBeneficiario.denomUnitOperBeneficiario,
      indirizzoBeneficiario:
        iNodoVerificaRPTOutput.nodoVerificaRPTRisposta.datiPagamentoPA
          .enteBeneficiario.indirizzoBeneficiario,
      civicoBeneficiario:
        iNodoVerificaRPTOutput.nodoVerificaRPTRisposta.datiPagamentoPA
          .enteBeneficiario.civicoBeneficiario,
      capBeneficiario:
        iNodoVerificaRPTOutput.nodoVerificaRPTRisposta.datiPagamentoPA
          .enteBeneficiario.capBeneficiario,
      localitaBeneficiario:
        iNodoVerificaRPTOutput.nodoVerificaRPTRisposta.datiPagamentoPA
          .enteBeneficiario.localitaBeneficiario,
      provinciaBeneficiario:
        iNodoVerificaRPTOutput.nodoVerificaRPTRisposta.datiPagamentoPA
          .enteBeneficiario.provinciaBeneficiario,
      nazioneBeneficiario:
        iNodoVerificaRPTOutput.nodoVerificaRPTRisposta.datiPagamentoPA
          .enteBeneficiario.nazioneBeneficiario
    },
    spezzoniCausaleVersamento:
      iNodoVerificaRPTOutput.nodoVerificaRPTRisposta.datiPagamentoPA
        .spezzoniCausaleVersamento
  });

  if (errorOrPaymentCheckResponse.isLeft()) {
    return new Left(new Error(ControllerError.ERROR_INVALID_INPUT));
  }
  return new Right(errorOrPaymentCheckResponse.value);
}

// Convert PaymentsActivationRequest (controller) to PaymentsActivationRequestPagoPa (PagoPa API)
export function getPaymentsActivationRequestPagoPa(
  paymentsActivationRequest: PaymentsActivationRequest
): Either<Error, InodoAttivaRPTInput> {
  const errorOrCodiceContestoPagamento = generateCodiceContestoPagamento();
  if (errorOrCodiceContestoPagamento.isLeft()) {
    return new Left(errorOrCodiceContestoPagamento.value);
  }
  return new Right({
    identificativoPSP: CONFIG.PAGOPA.IDENTIFIER.IDENTIFICATIVO_PSP,
    identificativoIntermediarioPSP:
      CONFIG.PAGOPA.IDENTIFIER.IDENTIFICATIVO_INTERMEDIARIO_PSP,
    identificativoCanale: CONFIG.PAGOPA.IDENTIFIER.IDENTIFICATIVO_CANALE,
    password: CONFIG.PAGOPA.IDENTIFIER.TOKEN,
    codiceContestoPagamento: errorOrCodiceContestoPagamento.value,
    identificativoIntermediarioPSPPagamento:
      CONFIG.PAGOPA.IDENTIFIER.IDENTIFICATIVO_INTERMEDIARIO_PSP,
    identificativoCanalePagamento:
      CONFIG.PAGOPA.IDENTIFIER.IDENTIFICATIVO_CANALE,
    codificaInfrastrutturaPSP:
      CONFIG.PAGOPA.PAYMENTS.CODIFICA_INFRASTRUTTURA_PSP,
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
}

// Convert PaymentsStatusUpdateRequestPagoPa (PagoPa API) to PaymentsStatusUpdateRequest (controller)
export function getPaymentsStatusUpdateRequest(
  paymentsStatusUpdateRequestPagoPa: IcdInfoWispInput
): Either<Error, PaymentsStatusUpdateRequest> {
  const errorOrPaymentsStatusUpdateRequest = PaymentsStatusUpdateRequest.decode(
    {
      codiceContestoPagamento:
        paymentsStatusUpdateRequestPagoPa.codiceContestoPagamento,
      codiceIdRPT: {
        CF: paymentsStatusUpdateRequestPagoPa.codiceIdRPT.CF,
        AuxDigit: paymentsStatusUpdateRequestPagoPa.codiceIdRPT.AuxDigit,
        CodStazPA: paymentsStatusUpdateRequestPagoPa.codiceIdRPT.CodStazPA,
        CodIUV: paymentsStatusUpdateRequestPagoPa.codiceIdRPT.CodIUV
      }
    }
  );

  if (errorOrPaymentsStatusUpdateRequest.isLeft()) {
    return new Left(new Error(ControllerError.ERROR_INVALID_INPUT));
  }

  return new Right(errorOrPaymentsStatusUpdateRequest.value);
}
