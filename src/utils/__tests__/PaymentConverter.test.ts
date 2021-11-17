import { isRight } from "fp-ts/lib/Either";
import { ImportoEuroCents } from "../../../generated/api/ImportoEuroCents";
import { PaymentFaultEnum } from "../../../generated/api/PaymentFault";
import { esitoNodoVerificaRPTRisposta_ppt } from "../../../generated/PagamentiTelematiciPspNodoservice/esitoNodoVerificaRPTRisposta_ppt";
import * as PaymentController from "../../controllers/restful/PaymentController";
import * as PaymentsConverter from "../PaymentsConverter";
import * as MockedData from "./MockedData";

// tslint:disable:max-line-length no-duplicate-string

describe("getNodoVerificaRPTInput", () => {
  it("should return a correct NodoVerificaRPTInput with auxDigit=0", () => {
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
      "qrc:QrCode": {
        "qrc:CF": MockedData.aRptId0.organizationFiscalCode,
        "qrc:CodStazPA": MockedData.applicationCode,
        "qrc:AuxDigit": MockedData.aRptId0.paymentNoticeNumber.auxDigit,
        "qrc:CodIUV": String(MockedData.iuv13).concat(
          String(MockedData.checkDigit)
        )
      }
    });
    expect(errorOrNodoVerificaRPTInput.value.codiceContestoPagamento).toMatch(
      MockedData.aCodiceContestoPagamento
    );
  });

  it("should return a correct NodoVerificaRPTInput with auxDigit=1", () => {
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
      "qrc:QrCode": {
        "qrc:CF": MockedData.aRptId1.organizationFiscalCode,
        "qrc:AuxDigit": MockedData.aRptId1.paymentNoticeNumber.auxDigit,
        "qrc:CodIUV": MockedData.iuv17
      }
    });
    expect(errorOrNodoVerificaRPTInput.value.codiceContestoPagamento).toMatch(
      MockedData.aCodiceContestoPagamento
    );
  });

  it("should return a correct NodoVerificaRPTInput with auxDigit=2", () => {
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
      "qrc:QrCode": {
        "qrc:CF": MockedData.aRptId2.organizationFiscalCode,
        "qrc:AuxDigit": MockedData.aRptId2.paymentNoticeNumber.auxDigit,
        "qrc:CodIUV": String(MockedData.iuv15).concat(
          String(MockedData.checkDigit)
        )
      }
    });
    expect(errorOrNodoVerificaRPTInput.value.codiceContestoPagamento).toMatch(
      MockedData.aCodiceContestoPagamento
    );
  });

  it("should return a correct NodoVerificaRPTInput with auxDigit=3", () => {
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
      "qrc:QrCode": {
        "qrc:CF": MockedData.aRptId3.organizationFiscalCode,
        "qrc:AuxDigit": MockedData.aRptId3.paymentNoticeNumber.auxDigit,
        "qrc:CodIUV": [
          MockedData.segregationCode,
          MockedData.iuv13,
          MockedData.checkDigit
        ].join("")
      }
    });
    expect(errorOrNodoVerificaRPTInput.value.codiceContestoPagamento).toMatch(
      MockedData.aCodiceContestoPagamento
    );
  });
});

describe("getPaymentsCheckResponse", () => {
  it("should convert NodoVerificaRPTOutput to PaymentsCheckResponse", () => {
    const errorOrPaymentCheckResponse = PaymentsConverter.getPaymentRequestsGetResponse(
      MockedData.aVerificaRPTOutput,
      MockedData.aCodiceContestoPagamento
    );

    // Check correct field mapping
    expect(isRight(errorOrPaymentCheckResponse)).toBeTruthy();

    const datiPagamentoPA = MockedData.aVerificaRPTOutput.datiPagamentoPA;
    expect(datiPagamentoPA).toBeDefined();
    if (datiPagamentoPA === undefined) {
      return;
    }

    const enteBeneficiario = datiPagamentoPA.enteBeneficiario;
    expect(enteBeneficiario).toBeDefined();
    if (enteBeneficiario === undefined) {
      return;
    }

    expect(errorOrPaymentCheckResponse.value).toMatchObject({
      enteBeneficiario: {
        identificativoUnivocoBeneficiario:
          enteBeneficiario.identificativoUnivocoBeneficiario
            .codiceIdentificativoUnivoco,
        denominazioneBeneficiario: enteBeneficiario.denominazioneBeneficiario,
        codiceUnitOperBeneficiario: enteBeneficiario.codiceUnitOperBeneficiario,
        denomUnitOperBeneficiario: enteBeneficiario.denomUnitOperBeneficiario,
        indirizzoBeneficiario: enteBeneficiario.indirizzoBeneficiario,
        civicoBeneficiario: enteBeneficiario.civicoBeneficiario,
        capBeneficiario: enteBeneficiario.capBeneficiario,
        localitaBeneficiario: enteBeneficiario.localitaBeneficiario,
        provinciaBeneficiario: enteBeneficiario.provinciaBeneficiario,
        nazioneBeneficiario: enteBeneficiario.nazioneBeneficiario
      }
    });
    expect(errorOrPaymentCheckResponse.value).toHaveProperty(
      "causaleVersamento",
      datiPagamentoPA.causaleVersamento
    );
    expect(errorOrPaymentCheckResponse.value).toHaveProperty(
      "importoSingoloVersamento",
      15098
    );
    expect(errorOrPaymentCheckResponse.value).toHaveProperty(
      "codiceContestoPagamento",
      MockedData.aCodiceContestoPagamento
    );
    expect(errorOrPaymentCheckResponse.value).toHaveProperty(
      "ibanAccredito",
      datiPagamentoPA.ibanAccredito
    );
  });

  it("should convert NodoVerificaRPTOutput NotFullFilled civicoBeneficiario to PaymentsCheckResponse", () => {
    const errorOrPaymentCheckResponse = PaymentsConverter.getPaymentRequestsGetResponse(
      ({
        esito: "OK",
        datiPagamentoPA: {
          importoSingoloVersamento: 150.98,
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
            civicoBeneficiario: null,
            capBeneficiario: "00000",
            localitaBeneficiario: "ROMA",
            provinciaBeneficiario: "ROMA",
            nazioneBeneficiario: "IT"
          },
          credenzialiPagatore: "NOMECOGNOME",
          causaleVersamento: "CAUSALE01"
        }
      } as unknown) as esitoNodoVerificaRPTRisposta_ppt,
      MockedData.aCodiceContestoPagamento
    );

    // Check correct field mapping
    expect(isRight(errorOrPaymentCheckResponse)).toBeTruthy();

    const datiPagamentoPA = MockedData.aVerificaRPTOutput.datiPagamentoPA;
    expect(datiPagamentoPA).toBeDefined();
    if (datiPagamentoPA === undefined) {
      return;
    }

    const enteBeneficiario = datiPagamentoPA.enteBeneficiario;
    expect(enteBeneficiario).toBeDefined();
    if (enteBeneficiario === undefined) {
      return;
    }

    expect(errorOrPaymentCheckResponse.value).toMatchObject({
      enteBeneficiario: {
        identificativoUnivocoBeneficiario:
          enteBeneficiario.identificativoUnivocoBeneficiario
            .codiceIdentificativoUnivoco,
        denominazioneBeneficiario: enteBeneficiario.denominazioneBeneficiario,
        codiceUnitOperBeneficiario: enteBeneficiario.codiceUnitOperBeneficiario,
        denomUnitOperBeneficiario: enteBeneficiario.denomUnitOperBeneficiario,
        indirizzoBeneficiario: enteBeneficiario.indirizzoBeneficiario,
        capBeneficiario: enteBeneficiario.capBeneficiario,
        localitaBeneficiario: enteBeneficiario.localitaBeneficiario,
        provinciaBeneficiario: enteBeneficiario.provinciaBeneficiario,
        nazioneBeneficiario: enteBeneficiario.nazioneBeneficiario
      }
    });
    expect(errorOrPaymentCheckResponse.value).toHaveProperty(
      "causaleVersamento",
      datiPagamentoPA.causaleVersamento
    );
    expect(errorOrPaymentCheckResponse.value).toHaveProperty(
      "importoSingoloVersamento",
      15098
    );
    expect(errorOrPaymentCheckResponse.value).toHaveProperty(
      "codiceContestoPagamento",
      MockedData.aCodiceContestoPagamento
    );
    expect(errorOrPaymentCheckResponse.value).toHaveProperty(
      "ibanAccredito",
      datiPagamentoPA.ibanAccredito
    );
  });
});

describe("getNodoAttivaRPTInput", () => {
  it("should convert PaymentsActivationPostRequest to NodoAttivaRPTInput", () => {
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
      MockedData.aConfig.IDENTIFIER.IDENTIFICATIVO_CANALE_PAGAMENTO
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
        "qrc:QrCode": {
          "qrc:CF": "12345678901",
          "qrc:AuxDigit": "0",
          "qrc:CodIUV": "123456789012312",
          "qrc:CodStazPA": "12"
        }
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
    expect(
      errorOrNodoAttivaRPTInput.value.datiPagamentoPSP.importoSingoloVersamento
    ).toEqual(99.05);
  });
});

describe("getPaymentsActivationResponse", () => {
  it("should convert NodoAttivaRPTOutput in PaymentsActivationResponse", () => {
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
  it("should convert CodiceContestoPagamento", () => {
    const codiceContesto = PaymentsConverter.getCodiceContestoPagamentoForPagoPaApi(
      MockedData.aCodiceContestoPagamento
    );
    expect(codiceContesto).toBe(MockedData.aCodiceContestoPagamento);
  });
});

describe("getResponseErrorIfExists", () => {
  it("should convert a KO Error without fault", () => {
    const responseError = PaymentController.getResponseErrorIfExists(undefined);
    expect(responseError).toBeUndefined();
  });

  it("should convert a KO Error with fault details", () => {
    const responseError = PaymentController.getResponseErrorIfExists(
      MockedData.aVerificaRPTOutputKOCompleted.fault
    );
    expect(responseError).toBeDefined();
    expect(responseError).toEqual(PaymentFaultEnum.PAYMENT_DUPLICATED);
  });
});

describe("getErrorMessageCtrlFromPagoPaError", () => {
  it("should convert a KO Short Error", () => {
    const fault = MockedData.aVerificaRPTOutputKOShort.fault;
    expect(fault).toBeDefined();
    if (fault === undefined) {
      return;
    }
    const errorMsg = PaymentController.getErrorMessageCtrlFromPagoPaError(
      fault.faultCode,
      fault.description,
      fault.originalFaultCode
    );
    expect(errorMsg).toBeDefined();
    expect(errorMsg).toEqual(PaymentFaultEnum.PAYMENT_DUPLICATED);
  });

  it("should convert a KO Completed Error", () => {
    const fault = MockedData.aVerificaRPTOutputKOCompleted.fault;
    expect(fault).toBeDefined();
    if (fault === undefined) {
      return;
    }
    const errorMsg = PaymentController.getErrorMessageCtrlFromPagoPaError(
      fault.faultCode,
      fault.description,
      fault.originalFaultCode
    );
    expect(errorMsg).toBeDefined();
    expect(errorMsg).toEqual(PaymentFaultEnum.PAYMENT_DUPLICATED);
    expect(fault.originalFaultCode).toEqual("PAA_PAGAMENTO_DUPLICATO");
  });

  it("should convert a KO Completed Error", () => {
    const fault = MockedData.aVerificaRPTOutputKOCompleted.fault;
    expect(fault).toBeDefined();
    if (fault === undefined) {
      return;
    }
    const errorMsg = PaymentController.getErrorMessageCtrlFromPagoPaError(
      "",
      `FaultCode PA: ${
        fault.originalFaultCode
      } FaultString PA: Pagamento in attesa risulta in corso all’Ente Creditore. Description PA: `
    );
    expect(errorMsg).toBeDefined();
    expect(errorMsg).toEqual(PaymentFaultEnum.PAYMENT_DUPLICATED);
    expect(fault.originalFaultCode).toEqual("PAA_PAGAMENTO_DUPLICATO");
  });

  it("should convert a KO Expired Error", () => {
    const fault = MockedData.aVerificaRPTOutputKOExpired.fault;
    expect(fault).toBeDefined();
    if (fault === undefined) {
      return;
    }
    const errorMsg = PaymentController.getErrorMessageCtrlFromPagoPaError(
      fault.faultCode,
      fault.description,
      fault.originalFaultCode
    );
    expect(errorMsg).toBeDefined();
    expect(errorMsg).toEqual(PaymentFaultEnum.PAYMENT_EXPIRED);
    expect(fault.originalFaultCode).toEqual("PAA_PAGAMENTO_SCADUTO");
  });
  it("should convert a KO Expired Error", () => {
    const fault = MockedData.aVerificaRPTOutputKOExpired.fault;
    expect(fault).toBeDefined();
    if (fault === undefined) {
      return;
    }
    const errorMsg = PaymentController.getErrorMessageCtrlFromPagoPaError(
      "",
      `FaultCode PA: ${
        fault.originalFaultCode
      } FaultString PA: Pagamento in attesa risulta in corso all’Ente Creditore. Description PA: `
    );
    expect(errorMsg).toBeDefined();
    expect(errorMsg).toEqual(PaymentFaultEnum.PAYMENT_EXPIRED);
    expect(fault.originalFaultCode).toEqual("PAA_PAGAMENTO_SCADUTO");
  });

  it("should convert a KO OnGoing Error", () => {
    const fault = MockedData.aVerificaRPTOutputKOOnGoing.fault;
    expect(fault).toBeDefined();
    if (fault === undefined) {
      return;
    }
    const errorMsg = PaymentController.getErrorMessageCtrlFromPagoPaError(
      fault.faultCode,
      fault.description,
      fault.originalFaultCode
    );
    expect(errorMsg).toBeDefined();
    expect(errorMsg).toEqual(PaymentFaultEnum.PAYMENT_ONGOING);
    expect(fault.originalFaultCode).toEqual("PAA_PAGAMENTO_IN_CORSO");
  });
  it("should convert a KO OnGoing Error", () => {
    const fault = MockedData.aVerificaRPTOutputKOOnGoing.fault;
    expect(fault).toBeDefined();
    if (fault === undefined) {
      return;
    }
    const errorMsg = PaymentController.getErrorMessageCtrlFromPagoPaError(
      "",
      `FaultCode PA:  ${
        fault.originalFaultCode
      } FaultString PA: Pagamento in attesa risulta in corso all’Ente Creditore. Description PA: `
    );
    expect(errorMsg).toBeDefined();
    expect(errorMsg).toEqual(PaymentFaultEnum.PAYMENT_ONGOING);
    expect(fault.originalFaultCode).toEqual("PAA_PAGAMENTO_IN_CORSO");
  });
  it("should convert a KO Generic Error", () => {
    const fault = MockedData.aVerificaRPTOutputKOGeneric.fault;
    expect(fault).toBeDefined();
    if (fault === undefined) {
      return;
    }
    const errorMsg = PaymentController.getErrorMessageCtrlFromPagoPaError(
      fault.faultCode,
      fault.description,
      fault.originalFaultCode
    );
    expect(errorMsg).toBeDefined();
    expect(errorMsg).toEqual(PaymentFaultEnum.PAYMENT_UNAVAILABLE);
    expect(fault.originalFaultCode).toEqual("PAA_CANALE_RICHIEDENTE_ERRATO");
  });
  it("should convert a KO Generic Error", () => {
    const fault = MockedData.aVerificaRPTOutputKOGeneric.fault;
    expect(fault).toBeDefined();
    if (fault === undefined) {
      return;
    }
    const errorMsg = PaymentController.getErrorMessageCtrlFromPagoPaError(
      "",
      `FaultCode PA:  ${
        fault.originalFaultCode
      } FaultString PA: Pagamento in attesa risulta in corso all’Ente Creditore. Description PA: `
    );
    expect(errorMsg).toBeDefined();
    expect(errorMsg).toEqual(PaymentFaultEnum.PAYMENT_UNAVAILABLE);
    expect(fault.originalFaultCode).toEqual("PAA_CANALE_RICHIEDENTE_ERRATO");
  });

  it("should convert a KO detailV2", () => {
    const fault = MockedData.aActivateKO.fault;
    expect(fault).toBeDefined();
    if (fault === undefined) {
      return;
    }

    const errorOrActivateIOPaymentInput = PaymentsConverter.getNodoActivateIOPaymentInput(
      MockedData.aConfig,
      MockedData.aRptId1,
      12000 as ImportoEuroCents
    );

    expect(isRight(errorOrActivateIOPaymentInput)).toBeTruthy();
    if (!isRight(errorOrActivateIOPaymentInput)) {
      return;
    }

    // tslint:disable-next-line:prettier
    expect(errorOrActivateIOPaymentInput.value.amount).toBe(120.00);

    const errorMsg = PaymentController.getDetailV2FromFaultCode(fault);
    expect(errorMsg).toBeDefined();
    expect(errorMsg).toEqual("PPT_SINTASSI_EXTRAXSD");
  });

  it("should convert a KO PA System Error", () => {
    const fault = MockedData.aVerificaRPTOutputKOPASystemError.fault;
    expect(fault).toBeDefined();
    if (fault === undefined) {
      return;
    }

    const errorMsg = PaymentController.getDetailV2FromFaultCode(fault);
    expect(errorMsg).toBeDefined();
    expect(errorMsg).toEqual("PAA_SYSTEM_ERROR");
  
  });
});
