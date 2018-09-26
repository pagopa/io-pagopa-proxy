import { isRight } from "fp-ts/lib/Either";
import * as PaymentController from "../../controllers/restful/PaymentController";
import { GetPaymentFaultEnum } from "../../types/api/GetPaymentFault";
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
        "qrc:CodIUV": String(MockedData.iuv13).concat(
          String(MockedData.checkDigit)
        )
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
      9905
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
  it("should recognize a message without errors", () => {
    const responseError = PaymentController.getResponseErrorIfExists(
      "OK",
      undefined
    );
    expect(responseError).toBeUndefined();
  });

  it("should convert a KO Error without fault", () => {
    const responseError = PaymentController.getResponseErrorIfExists(
      "KO",
      undefined
    );
    expect(responseError).toBeDefined();
    if (responseError !== undefined) {
      expect(responseError.kind).toEqual("IResponseErrorInternal");
    }
  });

  it("should convert a KO Error with fault details", () => {
    const responseError = PaymentController.getResponseErrorIfExists(
      MockedData.aVerificaRPTOutputKOCompleted.esito,
      MockedData.aVerificaRPTOutputKOCompleted.fault
    );
    expect(responseError).toBeDefined();
    if (responseError !== undefined) {
      expect(responseError.kind).toEqual("IResponseErrorInternal");
    }
  });
});

describe("getErrorMessageCtrlFromPagoPaError", () => {
  it("should convert a KO Completed Error", () => {
    const fault = MockedData.aVerificaRPTOutputKOCompleted.fault;
    expect(fault).toBeDefined();
    if (fault === undefined) {
      return;
    }
    const errorMsg = PaymentController.getErrorMessageCtrlFromPagoPaError(
      fault.faultCode,
      undefined
    );
    expect(errorMsg).toBeDefined();
    expect(errorMsg).toEqual(GetPaymentFaultEnum.PAYMENT_DUPLICATED);
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
        fault.faultCode
      } FaultString PA: Pagamento in attesa risulta in corso all’Ente Creditore. Description PA: `
    );
    expect(errorMsg).toBeDefined();
    expect(errorMsg).toEqual(GetPaymentFaultEnum.PAYMENT_DUPLICATED);
  });
  it("should convert a KO Expired Error", () => {
    const fault = MockedData.aVerificaRPTOutputKOExpired.fault;
    expect(fault).toBeDefined();
    if (fault === undefined) {
      return;
    }
    const errorMsg = PaymentController.getErrorMessageCtrlFromPagoPaError(
      fault.faultCode,
      undefined
    );
    expect(errorMsg).toBeDefined();
    expect(errorMsg).toEqual(GetPaymentFaultEnum.PAYMENT_EXPIRED);
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
        fault.faultCode
      } FaultString PA: Pagamento in attesa risulta in corso all’Ente Creditore. Description PA: `
    );
    expect(errorMsg).toBeDefined();
    expect(errorMsg).toEqual(GetPaymentFaultEnum.PAYMENT_EXPIRED);
  });
  it("should convert a KO OnGoing Error", () => {
    const fault = MockedData.aVerificaRPTOutputKOOnGoing.fault;
    expect(fault).toBeDefined();
    if (fault === undefined) {
      return;
    }
    const errorMsg = PaymentController.getErrorMessageCtrlFromPagoPaError(
      fault.faultCode,
      undefined
    );
    expect(errorMsg).toBeDefined();
    expect(errorMsg).toEqual(GetPaymentFaultEnum.PAYMENT_ONGOING);
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
        fault.faultCode
      } FaultString PA: Pagamento in attesa risulta in corso all’Ente Creditore. Description PA: `
    );
    expect(errorMsg).toBeDefined();
    expect(errorMsg).toEqual(GetPaymentFaultEnum.PAYMENT_ONGOING);
  });
  it("should convert a KO Generic Error", () => {
    const fault = MockedData.aVerificaRPTOutputKOGeneric.fault;
    expect(fault).toBeDefined();
    if (fault === undefined) {
      return;
    }
    const errorMsg = PaymentController.getErrorMessageCtrlFromPagoPaError(
      fault.faultCode,
      undefined
    );
    expect(errorMsg).toBeDefined();
    expect(errorMsg).toEqual(GetPaymentFaultEnum.PAYMENT_UNAVAILABLE);
  });
  it("should convert a KO Generic Error", () => {
    const fault = MockedData.aVerificaRPTOutputKOGeneric.fault;
    expect(fault).toBeDefined();
    if (fault === undefined) {
      return;
    }
    const errorMsg = PaymentController.getErrorMessageCtrlFromPagoPaError(
      fault.faultCode,
      "Pagamento in attesa risulta in corso all’Ente Creditore. "
    );
    expect(errorMsg).toBeDefined();
    expect(errorMsg).toEqual(GetPaymentFaultEnum.PAYMENT_UNAVAILABLE);
  });
});
