import { isRight } from "fp-ts/lib/Either";
import * as PaymentController from "../../controllers/restful/PaymentController";
import { ErrorMessagesCtrlEnum } from "../../types/ErrorMessagesCtrlEnum";
import * as PaymentsConverter from "../PaymentsConverter";
import * as MockedData from "./MockedData";

// tslint:disable:max-line-length no-duplicate-string

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

describe("getResponseErrorIfExists", () => {
  it(" should recognize a message without errors", () => {
    const responseError = PaymentController.getResponseErrorIfExists(
      "OK",
      undefined
    );
    expect(responseError).toBeUndefined();
  });

  it(" should convert a KO Error without fault", () => {
    const responseError = PaymentController.getResponseErrorIfExists(
      "KO",
      undefined
    );
    expect(responseError).toBeDefined();
    expect(responseError.kind).toEqual("IResponseErrorInternal");
  });

  it(" should convert a KO Error with fault details", () => {
    const responseError = PaymentController.getResponseErrorIfExists(
      MockedData.aVerificaRPTOutputKOCompleted.esito,
      MockedData.aVerificaRPTOutputKOCompleted.fault
    );
    expect(responseError).toBeDefined();
    expect(responseError.kind).toEqual("IResponseErrorGeneric");
  });
});

describe("getErrorMessageCtrlFromPagoPaError", () => {
  it(" should convert a KO Completed Error", () => {
    const errorMsg = PaymentController.getErrorMessageCtrlFromPagoPaError(
      MockedData.aVerificaRPTOutputKOCompleted.fault.faultCode,
      undefined
    );
    expect(errorMsg).toBeDefined();
    expect(errorMsg).toEqual(ErrorMessagesCtrlEnum.PAYMENT_COMPLETED);
  });
  it(" should convert a KO Completed Error", () => {
    const errorMsg = PaymentController.getErrorMessageCtrlFromPagoPaError(
      "",
      `FaultCode PA: ${
        MockedData.aVerificaRPTOutputKOCompleted.fault.faultCode
      } FaultString PA: Pagamento in attesa risulta in corso all’Ente Creditore. Description PA: `
    );
    expect(errorMsg).toBeDefined();
    expect(errorMsg).toEqual(ErrorMessagesCtrlEnum.PAYMENT_COMPLETED);
  });
  it(" should convert a KO Expired Error", () => {
    const errorMsg = PaymentController.getErrorMessageCtrlFromPagoPaError(
      MockedData.aVerificaRPTOutputKOExpired.fault.faultCode,
      undefined
    );
    expect(errorMsg).toBeDefined();
    expect(errorMsg).toEqual(ErrorMessagesCtrlEnum.PAYMENT_EXPIRED);
  });
  it(" should convert a KO Expired Error", () => {
    const errorMsg = PaymentController.getErrorMessageCtrlFromPagoPaError(
      "",
      `FaultCode PA: ${
        MockedData.aVerificaRPTOutputKOExpired.fault.faultCode
      } FaultString PA: Pagamento in attesa risulta in corso all’Ente Creditore. Description PA: `
    );
    expect(errorMsg).toBeDefined();
    expect(errorMsg).toEqual(ErrorMessagesCtrlEnum.PAYMENT_EXPIRED);
  });
  it(" should convert a KO OnGoing Error", () => {
    const errorMsg = PaymentController.getErrorMessageCtrlFromPagoPaError(
      MockedData.aVerificaRPTOutputKOOnGoing.fault.faultCode,
      undefined
    );
    expect(errorMsg).toBeDefined();
    expect(errorMsg).toEqual(ErrorMessagesCtrlEnum.PAYMENT_ONGOING);
  });
  it(" should convert a KO OnGoing Error", () => {
    const errorMsg = PaymentController.getErrorMessageCtrlFromPagoPaError(
      "",
      `FaultCode PA:  ${
        MockedData.aVerificaRPTOutputKOOnGoing.fault.faultCode
      } FaultString PA: Pagamento in attesa risulta in corso all’Ente Creditore. Description PA: `
    );
    expect(errorMsg).toBeDefined();
    expect(errorMsg).toEqual(ErrorMessagesCtrlEnum.PAYMENT_ONGOING);
  });
  it(" should convert a KO Generic Error", () => {
    const errorMsg = PaymentController.getErrorMessageCtrlFromPagoPaError(
      MockedData.aVerificaRPTOutputKOGeneric.fault.faultCode,
      undefined
    );
    expect(errorMsg).toBeDefined();
    expect(errorMsg).toEqual(ErrorMessagesCtrlEnum.PAYMENT_UNAVAILABLE);
  });
  it(" should convert a KO Generic Error", () => {
    const errorMsg = PaymentController.getErrorMessageCtrlFromPagoPaError(
      MockedData.aVerificaRPTOutputKOGeneric.fault.faultCode,
      "Pagamento in attesa risulta in corso all’Ente Creditore. "
    );
    expect(errorMsg).toBeDefined();
    expect(errorMsg).toEqual(ErrorMessagesCtrlEnum.PAYMENT_UNAVAILABLE);
  });
});
