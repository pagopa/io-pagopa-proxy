import { isRight } from "fp-ts/lib/Either";
import * as PaymentsConverter from "../PaymentsConverter";
import * as MockedData from "./MockedData";

// ts-lint:disable:max-line-length

describe("getNodoVerificaRPTInput", () => {
  it(" should return a correct NodoVerificaRPTInput with auxDigit=0", () => {
    const errorOrNodoVerificaRPTInput = PaymentsConverter.getNodoVerificaRPTInput(
      MockedData.aConfig,
      MockedData.aRptId0,
      MockedData.aCodiceContestoPagamento
    );

    // Check if object is valid
    expect(isRight(errorOrNodoVerificaRPTInput)).toBeTruthy();
    if (!isRight(errorOrNodoVerificaRPTInput)) {
      return;
    }

    // Check input heading
    expect(
      errorOrNodoVerificaRPTInput.value.identificativoIntermediarioPSP
    ).toBe(MockedData.aConfig.IDENTIFIER.IDENTIFICATIVO_INTERMEDIARIO_PSP);
    expect(errorOrNodoVerificaRPTInput.value.identificativoCanale).toBe(
      MockedData.aConfig.IDENTIFIER.IDENTIFICATIVO_CANALE
    );
    expect(errorOrNodoVerificaRPTInput.value.identificativoPSP).toBe(
      MockedData.aConfig.IDENTIFIER.IDENTIFICATIVO_PSP
    );
    expect(errorOrNodoVerificaRPTInput.value.password).toBe(
      MockedData.aConfig.IDENTIFIER.PASSWORD
    );

    // Check input content
    expect(errorOrNodoVerificaRPTInput.value.codificaInfrastrutturaPSP).toBe(
      "QR-CODE"
    );
    expect(errorOrNodoVerificaRPTInput.value.codiceIdRPT).toMatchObject({
      CF: MockedData.aRptId0.organizationFiscalCode,
      CodStazPA: MockedData.applicationCode,
      AuxDigit: MockedData.aRptId0.paymentNoticeNumber.auxDigit,
      CodIUV: MockedData.iuv13
    });
    expect(errorOrNodoVerificaRPTInput.value.codiceContestoPagamento).toMatch(
      MockedData.aCodiceContestoPagamento
    );
  });

  it(" should return a correct NodoVerificaRPTInput with auxDigit=1", () => {
    const errorOrNodoVerificaRPTInput = PaymentsConverter.getNodoVerificaRPTInput(
      MockedData.aConfig,
      MockedData.aRptId1,
      MockedData.aCodiceContestoPagamento
    );

    // Check if object is valid
    expect(isRight(errorOrNodoVerificaRPTInput)).toBeTruthy();
    if (!isRight(errorOrNodoVerificaRPTInput)) {
      return;
    }

    // Check input heading
    expect(
      errorOrNodoVerificaRPTInput.value.identificativoIntermediarioPSP
    ).toBe(MockedData.aConfig.IDENTIFIER.IDENTIFICATIVO_INTERMEDIARIO_PSP);
    expect(errorOrNodoVerificaRPTInput.value.identificativoCanale).toBe(
      MockedData.aConfig.IDENTIFIER.IDENTIFICATIVO_CANALE
    );
    expect(errorOrNodoVerificaRPTInput.value.identificativoPSP).toBe(
      MockedData.aConfig.IDENTIFIER.IDENTIFICATIVO_PSP
    );
    expect(errorOrNodoVerificaRPTInput.value.password).toBe(
      MockedData.aConfig.IDENTIFIER.PASSWORD
    );

    // Check input content
    expect(errorOrNodoVerificaRPTInput.value.codificaInfrastrutturaPSP).toBe(
      "QR-CODE"
    );
    expect(errorOrNodoVerificaRPTInput.value.codiceIdRPT).toMatchObject({
      CF: MockedData.aRptId1.organizationFiscalCode,
      AuxDigit: MockedData.aRptId1.paymentNoticeNumber.auxDigit,
      CodIUV: MockedData.iuv17
    });
    expect(errorOrNodoVerificaRPTInput.value.codiceContestoPagamento).toMatch(
      MockedData.aCodiceContestoPagamento
    );
  });

  it(" should return a correct NodoVerificaRPTInput with auxDigit=2", () => {
    const errorOrNodoVerificaRPTInput = PaymentsConverter.getNodoVerificaRPTInput(
      MockedData.aConfig,
      MockedData.aRptId2,
      MockedData.aCodiceContestoPagamento
    );

    // Check if object is valid
    expect(isRight(errorOrNodoVerificaRPTInput)).toBeTruthy();
    if (!isRight(errorOrNodoVerificaRPTInput)) {
      return;
    }

    // Check input heading
    expect(
      errorOrNodoVerificaRPTInput.value.identificativoIntermediarioPSP
    ).toBe(MockedData.aConfig.IDENTIFIER.IDENTIFICATIVO_INTERMEDIARIO_PSP);
    expect(errorOrNodoVerificaRPTInput.value.identificativoCanale).toBe(
      MockedData.aConfig.IDENTIFIER.IDENTIFICATIVO_CANALE
    );
    expect(errorOrNodoVerificaRPTInput.value.identificativoPSP).toBe(
      MockedData.aConfig.IDENTIFIER.IDENTIFICATIVO_PSP
    );
    expect(errorOrNodoVerificaRPTInput.value.password).toBe(
      MockedData.aConfig.IDENTIFIER.PASSWORD
    );

    // Check input content
    expect(errorOrNodoVerificaRPTInput.value.codificaInfrastrutturaPSP).toBe(
      "QR-CODE"
    );
    expect(errorOrNodoVerificaRPTInput.value.codiceIdRPT).toMatchObject({
      CF: MockedData.aRptId2.organizationFiscalCode,
      AuxDigit: MockedData.aRptId2.paymentNoticeNumber.auxDigit,
      CodIUV: MockedData.iuv15
    });
    expect(errorOrNodoVerificaRPTInput.value.codiceContestoPagamento).toMatch(
      MockedData.aCodiceContestoPagamento
    );
  });

  it(" should return a correct NodoVerificaRPTInput with auxDigit=3", () => {
    const errorOrNodoVerificaRPTInput = PaymentsConverter.getNodoVerificaRPTInput(
      MockedData.aConfig,
      MockedData.aRptId3,
      MockedData.aCodiceContestoPagamento
    );

    // Check if object is valid
    expect(isRight(errorOrNodoVerificaRPTInput)).toBeTruthy();
    if (!isRight(errorOrNodoVerificaRPTInput)) {
      return;
    }

    // Check input heading
    expect(
      errorOrNodoVerificaRPTInput.value.identificativoIntermediarioPSP
    ).toBe(MockedData.aConfig.IDENTIFIER.IDENTIFICATIVO_INTERMEDIARIO_PSP);
    expect(errorOrNodoVerificaRPTInput.value.identificativoCanale).toBe(
      MockedData.aConfig.IDENTIFIER.IDENTIFICATIVO_CANALE
    );
    expect(errorOrNodoVerificaRPTInput.value.identificativoPSP).toBe(
      MockedData.aConfig.IDENTIFIER.IDENTIFICATIVO_PSP
    );
    expect(errorOrNodoVerificaRPTInput.value.password).toBe(
      MockedData.aConfig.IDENTIFIER.PASSWORD
    );

    // Check input content
    expect(errorOrNodoVerificaRPTInput.value.codificaInfrastrutturaPSP).toBe(
      "QR-CODE"
    );
    expect(errorOrNodoVerificaRPTInput.value.codiceIdRPT).toMatchObject({
      CF: MockedData.aRptId3.organizationFiscalCode,
      AuxDigit: MockedData.aRptId3.paymentNoticeNumber.auxDigit,
      CodIUV: MockedData.iuv13
    });
    expect(errorOrNodoVerificaRPTInput.value.codiceContestoPagamento).toMatch(
      MockedData.aCodiceContestoPagamento
    );
  });
});

describe("getPaymentsCheckResponse", () => {
  it(" should convert NodoVerificaRPTOutput to PaymentsCheckResponse", () => {
    const errorOrPaymentCheckResponse = PaymentsConverter.getPaymentRequestsGetResponse(
      MockedData.aVerificaRPTOutput,
      MockedData.aCodiceContestoPagamento
    );

    // Check correct field mapping
    expect(isRight(errorOrPaymentCheckResponse)).toBeTruthy();
    expect(errorOrPaymentCheckResponse.value).toMatchObject({
      enteBeneficiario: {
        identificativoUnivocoBeneficiario:
          MockedData.aVerificaRPTOutput.datiPagamentoPA.enteBeneficiario
            .identificativoUnivocoBeneficiario.codiceIdentificativoUnivoco,
        denominazioneBeneficiario:
          MockedData.aVerificaRPTOutput.datiPagamentoPA.enteBeneficiario
            .denominazioneBeneficiario,
        codiceUnitOperBeneficiario:
          MockedData.aVerificaRPTOutput.datiPagamentoPA.enteBeneficiario
            .codiceUnitOperBeneficiario,
        denomUnitOperBeneficiario:
          MockedData.aVerificaRPTOutput.datiPagamentoPA.enteBeneficiario
            .denomUnitOperBeneficiario,
        indirizzoBeneficiario:
          MockedData.aVerificaRPTOutput.datiPagamentoPA.enteBeneficiario
            .indirizzoBeneficiario,
        civicoBeneficiario:
          MockedData.aVerificaRPTOutput.datiPagamentoPA.enteBeneficiario
            .civicoBeneficiario,
        capBeneficiario:
          MockedData.aVerificaRPTOutput.datiPagamentoPA.enteBeneficiario
            .capBeneficiario,
        localitaBeneficiario:
          MockedData.aVerificaRPTOutput.datiPagamentoPA.enteBeneficiario
            .localitaBeneficiario,
        provinciaBeneficiario:
          MockedData.aVerificaRPTOutput.datiPagamentoPA.enteBeneficiario
            .provinciaBeneficiario,
        nazioneBeneficiario:
          MockedData.aVerificaRPTOutput.datiPagamentoPA.enteBeneficiario
            .nazioneBeneficiario
      }
    });
    expect(errorOrPaymentCheckResponse.value).toHaveProperty(
      "causaleVersamento",
      MockedData.aVerificaRPTOutput.datiPagamentoPA.causaleVersamento
    );
    expect(errorOrPaymentCheckResponse.value).toHaveProperty(
      "importoSingoloVersamento",
      9905
    );
    expect(errorOrPaymentCheckResponse.value).toHaveProperty(
      "codiceContestoPagamento",
      MockedData.aCodiceContestoPagamento
    );
    expect(errorOrPaymentCheckResponse.value).toHaveProperty(
      "ibanAccredito",
      MockedData.aVerificaRPTOutput.datiPagamentoPA.ibanAccredito
    );
  });
});

describe("getNodoAttivaRPTInput", () => {
  it(" should convert PaymentsActivationPostRequest to NodoAttivaRPTInput", () => {
    const errorOrNodoAttivaRPTInput = PaymentsConverter.getNodoAttivaRPTInput(
      MockedData.aConfig,
      MockedData.aPaymentActivationsPostRequest
    );

    // Check if object is valid
    expect(isRight(errorOrNodoAttivaRPTInput)).toBeTruthy();
    if (!isRight(errorOrNodoAttivaRPTInput)) {
      return;
    }

    // Check input heading
    expect(errorOrNodoAttivaRPTInput.value.identificativoIntermediarioPSP).toBe(
      MockedData.aConfig.IDENTIFIER.IDENTIFICATIVO_INTERMEDIARIO_PSP
    );
    expect(
      errorOrNodoAttivaRPTInput.value.identificativoIntermediarioPSPPagamento
    ).toBe(MockedData.aConfig.IDENTIFIER.IDENTIFICATIVO_INTERMEDIARIO_PSP);
    expect(errorOrNodoAttivaRPTInput.value.identificativoCanale).toBe(
      MockedData.aConfig.IDENTIFIER.IDENTIFICATIVO_CANALE
    );
    expect(errorOrNodoAttivaRPTInput.value.identificativoCanalePagamento).toBe(
      MockedData.aConfig.IDENTIFIER.IDENTIFICATIVO_CANALE
    );
    expect(errorOrNodoAttivaRPTInput.value.identificativoPSP).toBe(
      MockedData.aConfig.IDENTIFIER.IDENTIFICATIVO_PSP
    );
    expect(errorOrNodoAttivaRPTInput.value.password).toBe(
      MockedData.aConfig.IDENTIFIER.PASSWORD
    );

    // Check input content
    expect(errorOrNodoAttivaRPTInput.value).toMatchObject({
      codiceIdRPT: {
        CF: "12345678901",
        AuxDigit: "0",
        CodIUV: "1234567890123",
        CodStazPA: "12"
      }
    });
    expect(errorOrNodoAttivaRPTInput.value).toHaveProperty(
      "codiceContestoPagamento",
      MockedData.aCodiceContestoPagamento
    );
    expect(errorOrNodoAttivaRPTInput.value).toHaveProperty(
      "codificaInfrastrutturaPSP",
      "QR-CODE"
    );
  });
});

describe("getPaymentsActivationResponse", () => {
  it(" should convert NodoAttivaRPTOutput in PaymentsActivationResponse", () => {
    const errorOrPaymentActivationsPostResponse = PaymentsConverter.getPaymentActivationsPostResponse(
      MockedData.anAttivaRPTOutput
    );
    expect(isRight(errorOrPaymentActivationsPostResponse)).toBeTruthy();
    if (!isRight(errorOrPaymentActivationsPostResponse)) {
      return;
    }
    expect(
      errorOrPaymentActivationsPostResponse.value.importoSingoloVersamento
    ).toBe(9905);
  });
});

describe("getCodiceContestoPagamentoForPagoPaApi", () => {
  it(" should convert CodiceContestoPagamento", () => {
    const codiceContesto = PaymentsConverter.getCodiceContestoPagamentoForPagoPaApi(
      MockedData.aCodiceContestoPagamento
    );
    expect(codiceContesto).toBe(MockedData.aCodiceContestoPagamento);
  });
});

describe("getSpezzoniCausaleVersamentoForController", () => {
  it(" should convert SpezzoniCausaleVersamento", () => {
    const spezzoniCausale = PaymentsConverter.getSpezzoniCausaleVersamentoForController(
      MockedData.aSpezzoniCausaleVersamento
    );
    expect(spezzoniCausale).toBeDefined();
    expect(spezzoniCausale).toMatchObject(
      MockedData.aSpezzoniCausaleVersamento.spezzoniCausaleVersamento
    );
  });

  it(" should convert SpezzoniCausaleVersamentoStrutturato", () => {
    const spezzoniCausale = PaymentsConverter.getSpezzoniCausaleVersamentoForController(
      MockedData.aSpezzoniCausaleVersamentoStrutturato
    );
    expect(spezzoniCausale).toBeDefined();
    expect(spezzoniCausale).toMatchObject(
      MockedData.aSpezzoniCausaleVersamentoStrutturatoForController
        .spezzoniStrutturatoCausaleVersamento
    );
  });
});
