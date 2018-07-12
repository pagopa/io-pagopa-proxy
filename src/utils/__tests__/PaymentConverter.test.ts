import { isRight } from "fp-ts/lib/Either";
import { reporters } from "italia-ts-commons";
import { RptId } from "italia-ts-commons/lib/pagopa";
import { CONFIG as Config, PagoPAConfig } from "../../Configuration";
import { CodiceContestoPagamento } from "../../types/api/CodiceContestoPagamento";
import { PaymentActivationsPostRequest } from "../../types/api/PaymentActivationsPostRequest";
import { esitoNodoAttivaRPTRisposta_ppt } from "../../types/pagopa_api/yaml-to-ts/esitoNodoAttivaRPTRisposta_ppt";
import { esitoNodoVerificaRPTRisposta_ppt } from "../../types/pagopa_api/yaml-to-ts/esitoNodoVerificaRPTRisposta_ppt";
import {
  getInodoAttivaRPTInput,
  getInodoVerificaRPTInput,
  getPaymentActivationsPostResponse,
  getPaymentRequestsGetResponse
} from "../PaymentsConverter";

const aVerificaRPTOutput = esitoNodoVerificaRPTRisposta_ppt
  .decode({
    esito: "OK",
    datiPagamentoPA: {
      importoSingoloVersamento: 99.05,
      ibanAccredito: "IT17X0605502100000001234567",
      bicAccredito: "BPPIITRR",
      enteBeneficiario: {
        identificativoUnivocoBeneficiario: {
          tipoIdentificativoUnivoco: "G",
          codiceIdentificativoUnivoco: "001"
        },
        denominazioneBeneficiario: "BANCA01",
        codiceUnitOperBeneficiario: "01",
        denomUnitOperBeneficiario: "DENOM01",
        indirizzoBeneficiario: "VIAROMA",
        civicoBeneficiario: "01",
        capBeneficiario: "00000",
        localitaBeneficiario: "ROMA",
        provinciaBeneficiario: "ROMA",
        nazioneBeneficiario: "IT"
      },
      credenzialiPagatore: "NOMECOGNOME",
      causaleVersamento: "CAUSALE01"
    }
  })
  .getOrElseL(errors => {
    throw Error(
      `Invalid esitoNodoVerificaRPTRisposta_ppt to decode: ${reporters.readableReport(
        errors
      )}`
    );
  });

const anAttivaRPTOutput = esitoNodoAttivaRPTRisposta_ppt
  .decode({
    esito: "OK",
    datiPagamentoPA: {
      importoSingoloVersamento: 99.05,
      ibanAccredito: "IT17X0605502100000001234567",
      bicAccredito: "BPPIITRR",
      enteBeneficiario: {
        identificativoUnivocoBeneficiario: {
          tipoIdentificativoUnivoco: "G",
          codiceIdentificativoUnivoco: "001"
        },
        denominazioneBeneficiario: "BANCA01",
        codiceUnitOperBeneficiario: "01",
        denomUnitOperBeneficiario: "DENOM01",
        indirizzoBeneficiario: "VIAROMA",
        civicoBeneficiario: "01",
        capBeneficiario: "00000",
        localitaBeneficiario: "ROMA",
        provinciaBeneficiario: "ROMA",
        nazioneBeneficiario: "IT"
      },
      credenzialiPagatore: "NOMECOGNOME",
      causaleVersamento: "CAUSALE01"
    }
  })
  .getOrElseL(errors => {
    throw Error(
      `Invalid esitoNodoAttivaRPTRisposta_ppt to decode: ${reporters.readableReport(
        errors
      )}`
    );
  });

const aCodiceContestoPagamento: CodiceContestoPagamento = "8447a9f0746811e89a8d5d4209060ab0" as CodiceContestoPagamento;

const aRptId = RptId.decode({
  organizationFiscalCode: "12345678901",
  paymentNoticeNumber: {
    applicationCode: "12",
    auxDigit: "0",
    checkDigit: "12",
    iuv13: "1234567890123"
  }
}).getOrElseL(errors => {
  throw Error(`Invalid RptId to decode: ${reporters.readableReport(errors)}`);
});

const aPaymentActivationsPostRequest = PaymentActivationsPostRequest.decode({
  rptId: "12345678901012123456789012399",
  importoSingoloVersamento: 9905,
  codiceContestoPagamento: aCodiceContestoPagamento
}).getOrElseL(errors => {
  throw Error(
    `Invalid PaymentActivationsPostRequest to decode: ${reporters.readableReport(
      errors
    )}`
  );
});

const aConfig = {
  HOST: process.env.PAGOPA_HOST || "http://localhost",
  PORT: process.env.PAGOPA_PORT || "3001",
  WS_SERVICES: {
    PAGAMENTI: "/PagamentiTelematiciPspNodoservice/"
  },
  // These information will identify our system when it will access to PagoPA
  IDENTIFIER: {
    IDENTIFICATIVO_PSP: "AGID_01",
    IDENTIFICATIVO_INTERMEDIARIO_PSP: "97735020584",
    IDENTIFICATIVO_CANALE: "97735020584_02",
    PASSWORD: process.env.PAGOPA_PASSWORD || "nopassword"
  }
};

describe("getINodoVerificaRPTInput", () => {
  it("should return a correct nodoVerificaRPTInput", () => {
    const errorOrNodoVerificaRPTInput = getInodoVerificaRPTInput(
      aConfig as PagoPAConfig,
      aRptId,
      aCodiceContestoPagamento
    );

    expect(isRight(errorOrNodoVerificaRPTInput)).toBeTruthy();
    if (isRight(errorOrNodoVerificaRPTInput)) {
      expect(errorOrNodoVerificaRPTInput.value.codiceIdRPT).toMatchObject({
        CF: "12345678901",
        CodStazPA: "12",
        AuxDigit: "0",
        CodIUV: "1234567890123"
      });
      expect(errorOrNodoVerificaRPTInput.value.codificaInfrastrutturaPSP).toBe(
        "QR-CODE"
      );
      expect(errorOrNodoVerificaRPTInput.value.identificativoCanale).toBe(
        "97735020584_02"
      );
      expect(
        errorOrNodoVerificaRPTInput.value.identificativoIntermediarioPSP
      ).toBe("97735020584");
      expect(errorOrNodoVerificaRPTInput.value.password).toBe(
        aConfig.IDENTIFIER.PASSWORD
      );
      expect(
        isRight(
          CodiceContestoPagamento.decode(
            errorOrNodoVerificaRPTInput.value.codiceContestoPagamento
          )
        )
      ).toBeTruthy();
    }
  });
});

describe("getPaymentsCheckResponse", () => {
  it("should convert InodoVerificaRPTOutput to PaymentsCheckResponse", () => {
    const errorOrPaymentCheckResponse = getPaymentRequestsGetResponse(
      aVerificaRPTOutput,
      aCodiceContestoPagamento
    );
    expect(isRight(errorOrPaymentCheckResponse)).toBeTruthy();
    expect(errorOrPaymentCheckResponse.value).toMatchObject({
      enteBeneficiario: {
        identificativoUnivocoBeneficiario: "001",
        denominazioneBeneficiario: "BANCA01",
        codiceUnitOperBeneficiario: "01",
        denomUnitOperBeneficiario: "DENOM01",
        indirizzoBeneficiario: "VIAROMA",
        civicoBeneficiario: "01",
        capBeneficiario: "00000",
        localitaBeneficiario: "ROMA",
        provinciaBeneficiario: "ROMA",
        nazioneBeneficiario: "IT"
      }
    });
    expect(errorOrPaymentCheckResponse.value).toHaveProperty(
      "causaleVersamento",
      "CAUSALE01"
    );
    expect(errorOrPaymentCheckResponse.value).toHaveProperty(
      "importoSingoloVersamento",
      9905
    );
    expect(errorOrPaymentCheckResponse.value).toHaveProperty(
      "codiceContestoPagamento",
      aCodiceContestoPagamento
    );
    expect(errorOrPaymentCheckResponse.value).toHaveProperty(
      "ibanAccredito",
      "IT17X0605502100000001234567"
    );
  });
});

describe("getPaymentsActivationRequestPagoPA", () => {
  it("should convert PaymentsActivationRequest to InodoAttivaRPTInput (case when Auxdigit is 0)", () => {
    const errorOrNodoAttivaRPTInput = getInodoAttivaRPTInput(
      aConfig as PagoPAConfig,
      aPaymentActivationsPostRequest
    );
    expect(isRight(errorOrNodoAttivaRPTInput)).toBeTruthy();
    expect(errorOrNodoAttivaRPTInput.value).toMatchObject({
      codiceIdRPT: {
        CF: "12345678901",
        AuxDigit: "0",
        CodIUV: "1234567890123",
        CodStazPA: "12"
      }
    });
    expect(errorOrNodoAttivaRPTInput.value).toHaveProperty(
      "identificativoPSP",
      Config.PAGOPA.IDENTIFIER.IDENTIFICATIVO_PSP
    );
    expect(errorOrNodoAttivaRPTInput.value).toHaveProperty(
      "identificativoIntermediarioPSP",
      Config.PAGOPA.IDENTIFIER.IDENTIFICATIVO_INTERMEDIARIO_PSP
    );
    expect(errorOrNodoAttivaRPTInput.value).toHaveProperty(
      "identificativoCanale",
      Config.PAGOPA.IDENTIFIER.IDENTIFICATIVO_CANALE
    );
    expect(errorOrNodoAttivaRPTInput.value).toHaveProperty(
      "password",
      Config.PAGOPA.IDENTIFIER.PASSWORD
    );
    expect(errorOrNodoAttivaRPTInput.value).toHaveProperty(
      "codiceContestoPagamento",
      aCodiceContestoPagamento
    );
    expect(errorOrNodoAttivaRPTInput.value).toHaveProperty(
      "identificativoIntermediarioPSPPagamento",
      Config.PAGOPA.IDENTIFIER.IDENTIFICATIVO_INTERMEDIARIO_PSP
    );
    expect(errorOrNodoAttivaRPTInput.value).toHaveProperty(
      "identificativoCanalePagamento",
      Config.PAGOPA.IDENTIFIER.IDENTIFICATIVO_CANALE
    );
    expect(errorOrNodoAttivaRPTInput.value).toHaveProperty(
      "codificaInfrastrutturaPSP",
      "QR-CODE"
    );
  });
});

describe("getPaymentsActivationResponse", () => {
  it("Should convert InodoAttivaRPTOutput in PaymentsActivationResponse", () => {
    const errorOrAttivaRPTOutput = getPaymentActivationsPostResponse(
      anAttivaRPTOutput
    );
    expect(isRight(errorOrAttivaRPTOutput)).toBeTruthy();
    if (isRight(errorOrAttivaRPTOutput)) {
      expect(errorOrAttivaRPTOutput.value.importoSingoloVersamento).toBe(9905);
    }
  });
});
