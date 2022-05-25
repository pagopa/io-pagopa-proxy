import { getOrElseW, isRight } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { ImportoEuroCents } from "../../../generated/api/ImportoEuroCents";
import { PaymentFaultEnum } from "../../../generated/api/PaymentFault";
import { esitoNodoVerificaRPTRisposta_type_ppt } from "../../../generated/PagamentiTelematiciPspNodoservice/esitoNodoVerificaRPTRisposta_type_ppt";
import * as PaymentController from "../../controllers/restful/PaymentController";
import { ApplicationCode, AuxDigit, CheckDigit, IUV13, IUV15, IUV17, PaymentNoticeNumber } from "../pagopa";
import * as PaymentsConverter from "../PaymentsConverter";
import * as MockedData from "./MockedData";
import { MOCK_CLIENT_ID } from "./MockedData";
import { FaultCategoryEnum } from "../../../generated/api/FaultCategory";

describe("getNodoVerificaRPTInput", () => {
  it("should return a correct NodoVerificaRPTInput with auxDigit=0", () => {
    const errorOrNodoVerificaRPTInput = PaymentsConverter.getNodoVerificaRPTInput(MockedData.aConfig.IDENTIFIERS.CLIENT_IO, MockedData.aRptId0, MockedData.aCodiceContestoPagamento);

    // Check if object is valid
    expect(isRight(errorOrNodoVerificaRPTInput)).toBeTruthy();
    if (!isRight(errorOrNodoVerificaRPTInput)) {
      return;
    }

    // Check input heading
    expect(
      errorOrNodoVerificaRPTInput.right.identificativoIntermediarioPSP
    ).toBe(MockedData.aConfig.IDENTIFIERS[MOCK_CLIENT_ID].IDENTIFICATIVO_INTERMEDIARIO_PSP);
    expect(errorOrNodoVerificaRPTInput.right.identificativoCanale).toBe(
      MockedData.aConfig.IDENTIFIERS[MOCK_CLIENT_ID].IDENTIFICATIVO_CANALE
    );
    expect(errorOrNodoVerificaRPTInput.right.identificativoPSP).toBe(
      MockedData.aConfig.IDENTIFIERS[MOCK_CLIENT_ID].IDENTIFICATIVO_PSP
    );
    expect(errorOrNodoVerificaRPTInput.right.password).toBe(
      MockedData.aConfig.IDENTIFIERS[MOCK_CLIENT_ID].PASSWORD
    );

    // Check input content
    expect(errorOrNodoVerificaRPTInput.right.codificaInfrastrutturaPSP).toBe(
      "QR-CODE"
    );
    expect(errorOrNodoVerificaRPTInput.right.codiceIdRPT).toMatchObject({
      "qrc:QrCode": {
        "qrc:CF": MockedData.aRptId0.organizationFiscalCode,
        "qrc:CodStazPA": MockedData.applicationCode,
        "qrc:AuxDigit": MockedData.aRptId0.paymentNoticeNumber.auxDigit,
        "qrc:CodIUV": String(MockedData.iuv13).concat(
          String(MockedData.checkDigit)
        )
      }
    });
    expect(errorOrNodoVerificaRPTInput.right.codiceContestoPagamento).toMatch(
      MockedData.aCodiceContestoPagamento
    );
  });

  it("should return a correct NodoVerificaRPTInput with auxDigit=1", () => {
    const errorOrNodoVerificaRPTInput = PaymentsConverter.getNodoVerificaRPTInput( MockedData.aConfig.IDENTIFIERS.CLIENT_CHECKOUT, MockedData.aRptId1, MockedData.aCodiceContestoPagamento);

    // Check if object is valid
    expect(isRight(errorOrNodoVerificaRPTInput)).toBeTruthy();
    if (!isRight(errorOrNodoVerificaRPTInput)) {
      return;
    }

    // Check input heading
    expect(
      errorOrNodoVerificaRPTInput.right.identificativoIntermediarioPSP
    ).toBe(MockedData.aConfig.IDENTIFIERS[MOCK_CLIENT_ID].IDENTIFICATIVO_INTERMEDIARIO_PSP);
    expect(errorOrNodoVerificaRPTInput.right.identificativoCanale).toBe(
      MockedData.aConfig.IDENTIFIERS[MOCK_CLIENT_ID].IDENTIFICATIVO_CANALE
    );
    expect(errorOrNodoVerificaRPTInput.right.identificativoPSP).toBe(
      MockedData.aConfig.IDENTIFIERS[MOCK_CLIENT_ID].IDENTIFICATIVO_PSP
    );
    expect(errorOrNodoVerificaRPTInput.right.password).toBe(
      MockedData.aConfig.IDENTIFIERS[MOCK_CLIENT_ID].PASSWORD
    );

    // Check input content
    expect(errorOrNodoVerificaRPTInput.right.codificaInfrastrutturaPSP).toBe(
      "QR-CODE"
    );
    expect(errorOrNodoVerificaRPTInput.right.codiceIdRPT).toMatchObject({
      "qrc:QrCode": {
        "qrc:CF": MockedData.aRptId1.organizationFiscalCode,
        "qrc:AuxDigit": MockedData.aRptId1.paymentNoticeNumber.auxDigit,
        "qrc:CodIUV": MockedData.iuv17
      }
    });
    expect(errorOrNodoVerificaRPTInput.right.codiceContestoPagamento).toMatch(
      MockedData.aCodiceContestoPagamento
    );
  });

  it("should return a correct NodoVerificaRPTInput with auxDigit=2", () => {
    const errorOrNodoVerificaRPTInput = PaymentsConverter.getNodoVerificaRPTInput( MockedData.aConfig.IDENTIFIERS.CLIENT_CHECKOUT, MockedData.aRptId2, MockedData.aCodiceContestoPagamento);

    // Check if object is valid
    expect(isRight(errorOrNodoVerificaRPTInput)).toBeTruthy();
    if (!isRight(errorOrNodoVerificaRPTInput)) {
      return;
    }

    // Check input heading
    expect(
      errorOrNodoVerificaRPTInput.right.identificativoIntermediarioPSP
    ).toBe(MockedData.aConfig.IDENTIFIERS[MOCK_CLIENT_ID].IDENTIFICATIVO_INTERMEDIARIO_PSP);
    expect(errorOrNodoVerificaRPTInput.right.identificativoCanale).toBe(
      MockedData.aConfig.IDENTIFIERS[MOCK_CLIENT_ID].IDENTIFICATIVO_CANALE
    );
    expect(errorOrNodoVerificaRPTInput.right.identificativoPSP).toBe(
      MockedData.aConfig.IDENTIFIERS[MOCK_CLIENT_ID].IDENTIFICATIVO_PSP
    );
    expect(errorOrNodoVerificaRPTInput.right.password).toBe(
      MockedData.aConfig.IDENTIFIERS[MOCK_CLIENT_ID].PASSWORD
    );

    // Check input content
    expect(errorOrNodoVerificaRPTInput.right.codificaInfrastrutturaPSP).toBe(
      "QR-CODE"
    );
    expect(errorOrNodoVerificaRPTInput.right.codiceIdRPT).toMatchObject({
      "qrc:QrCode": {
        "qrc:CF": MockedData.aRptId2.organizationFiscalCode,
        "qrc:AuxDigit": MockedData.aRptId2.paymentNoticeNumber.auxDigit,
        "qrc:CodIUV": String(MockedData.iuv15).concat(
          String(MockedData.checkDigit)
        )
      }
    });
    expect(errorOrNodoVerificaRPTInput.right.codiceContestoPagamento).toMatch(
      MockedData.aCodiceContestoPagamento
    );
  });

  it("should return a correct NodoVerificaRPTInput with auxDigit=3", () => {
    const errorOrNodoVerificaRPTInput = PaymentsConverter.getNodoVerificaRPTInput(MockedData.aConfig.IDENTIFIERS.CLIENT_IO, MockedData.aRptId3, MockedData.aCodiceContestoPagamento);

    // Check if object is valid
    expect(isRight(errorOrNodoVerificaRPTInput)).toBeTruthy();
    if (!isRight(errorOrNodoVerificaRPTInput)) {
      return;
    }

    // Check input heading
    expect(
      errorOrNodoVerificaRPTInput.right.identificativoIntermediarioPSP
    ).toBe(MockedData.aConfig.IDENTIFIERS[MOCK_CLIENT_ID].IDENTIFICATIVO_INTERMEDIARIO_PSP);
    expect(errorOrNodoVerificaRPTInput.right.identificativoCanale).toBe(
      MockedData.aConfig.IDENTIFIERS[MOCK_CLIENT_ID].IDENTIFICATIVO_CANALE
    );
    expect(errorOrNodoVerificaRPTInput.right.identificativoPSP).toBe(
      MockedData.aConfig.IDENTIFIERS[MOCK_CLIENT_ID].IDENTIFICATIVO_PSP
    );
    expect(errorOrNodoVerificaRPTInput.right.password).toBe(
      MockedData.aConfig.IDENTIFIERS[MOCK_CLIENT_ID].PASSWORD
    );

    // Check input content
    expect(errorOrNodoVerificaRPTInput.right.codificaInfrastrutturaPSP).toBe(
      "QR-CODE"
    );
    expect(errorOrNodoVerificaRPTInput.right.codiceIdRPT).toMatchObject({
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
    expect(errorOrNodoVerificaRPTInput.right.codiceContestoPagamento).toMatch(
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

    const paymentCheckResponse = pipe(
      errorOrPaymentCheckResponse, 
      getOrElseW(_=> { throw new Error("Cannot decode errorOrPaymentCheckResponse"); 
      })
    );

    expect(paymentCheckResponse).toMatchObject({
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
    expect(paymentCheckResponse).toHaveProperty(
      "causaleVersamento",
      datiPagamentoPA.causaleVersamento
    );
    expect(paymentCheckResponse).toHaveProperty(
      "importoSingoloVersamento",
      15098
    );
    expect(paymentCheckResponse).toHaveProperty(
      "codiceContestoPagamento",
      MockedData.aCodiceContestoPagamento
    );
    expect(paymentCheckResponse).toHaveProperty(
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
      } as unknown) as esitoNodoVerificaRPTRisposta_type_ppt,
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
    const paymentCheckResponse = pipe(
      errorOrPaymentCheckResponse, 
      getOrElseW(_=> { throw new Error("Cannot decode errorOrPaymentCheckResponse"); 
      })
    );

    expect(paymentCheckResponse).toMatchObject({
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
    expect(paymentCheckResponse).toHaveProperty(
      "causaleVersamento",
      datiPagamentoPA.causaleVersamento
    );
    expect(paymentCheckResponse).toHaveProperty(
      "importoSingoloVersamento",
      15098
    );
    expect(paymentCheckResponse).toHaveProperty(
      "codiceContestoPagamento",
      MockedData.aCodiceContestoPagamento
    );
    expect(paymentCheckResponse).toHaveProperty(
      "ibanAccredito",
      datiPagamentoPA.ibanAccredito
    );
  });
});

describe("getNodoAttivaRPTInput", () => {
  it("should convert PaymentsActivationPostRequest to NodoAttivaRPTInput", () => {
    const errorOrNodoAttivaRPTInput = PaymentsConverter.getNodoAttivaRPTInput(
      MockedData.aConfig.IDENTIFIERS.CLIENT_IO,
      MockedData.aPaymentActivationsPostRequest
    );

    // Check if object is valid
    expect(isRight(errorOrNodoAttivaRPTInput)).toBeTruthy();
    if (!isRight(errorOrNodoAttivaRPTInput)) {
      return;
    }

    // Check input heading
    expect(errorOrNodoAttivaRPTInput.right.identificativoIntermediarioPSP).toBe(
      MockedData.aConfig.IDENTIFIERS[MOCK_CLIENT_ID].IDENTIFICATIVO_INTERMEDIARIO_PSP
    );
    expect(
      errorOrNodoAttivaRPTInput.right.identificativoIntermediarioPSPPagamento
    ).toBe(MockedData.aConfig.IDENTIFIERS[MOCK_CLIENT_ID].IDENTIFICATIVO_INTERMEDIARIO_PSP);
    expect(errorOrNodoAttivaRPTInput.right.identificativoCanale).toBe(
      MockedData.aConfig.IDENTIFIERS[MOCK_CLIENT_ID].IDENTIFICATIVO_CANALE
    );
    expect(errorOrNodoAttivaRPTInput.right.identificativoCanalePagamento).toBe(
      MockedData.aConfig.IDENTIFIERS[MOCK_CLIENT_ID].IDENTIFICATIVO_CANALE_PAGAMENTO
    );
    expect(errorOrNodoAttivaRPTInput.right.identificativoPSP).toBe(
      MockedData.aConfig.IDENTIFIERS[MOCK_CLIENT_ID].IDENTIFICATIVO_PSP
    );
    expect(errorOrNodoAttivaRPTInput.right.password).toBe(
      MockedData.aConfig.IDENTIFIERS[MOCK_CLIENT_ID].PASSWORD
    );

    // Check input content
    expect(errorOrNodoAttivaRPTInput.right).toMatchObject({
      codiceIdRPT: {
        "qrc:QrCode": {
          "qrc:CF": "12345678901",
          "qrc:AuxDigit": "0",
          "qrc:CodIUV": "123456789012312",
          "qrc:CodStazPA": "12"
        }
      }
    });
    expect(errorOrNodoAttivaRPTInput.right).toHaveProperty(
      "codiceContestoPagamento",
      MockedData.aCodiceContestoPagamento
    );
    expect(errorOrNodoAttivaRPTInput.right).toHaveProperty(
      "codificaInfrastrutturaPSP",
      "QR-CODE"
    );
    expect(
      errorOrNodoAttivaRPTInput.right.datiPagamentoPSP.importoSingoloVersamento
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
      errorOrPaymentActivationsPostResponse.right.importoSingoloVersamento
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
    expect(responseError).toEqual({
      category: PaymentFaultEnum.PAYMENT_DUPLICATED,
      detail: PaymentFaultEnum.PAYMENT_DUPLICATED
    });
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
      MockedData.aConfig.IDENTIFIERS.CLIENT_CHECKOUT,
      MockedData.aRptId1,
      12000 as ImportoEuroCents
    );

    expect(isRight(errorOrActivateIOPaymentInput)).toBeTruthy();
    if (!isRight(errorOrActivateIOPaymentInput)) {
      return;
    }

    expect(errorOrActivateIOPaymentInput.right.amount).toBe(120.0);

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

  it("should convert a KO PA unknown Error", () => {
    const fault = MockedData.aVerificaRPTOutputKOPAUnknownError.fault;
    expect(fault).toBeDefined();
    if (fault === undefined) {
      return;
    }

    const errorMsg = PaymentController.getDetailV2FromFaultCode(fault);
    expect(errorMsg).toBeDefined();
    expect(errorMsg).toEqual("PPT_ERRORE_EMESSO_DA_PAA");
  });
});

describe("getFaultCodeCategory", () => {
  it("should convert a KO Short Error", () => {
    const fault = MockedData.aVerificaRPTOutputKOShort.fault;
    expect(fault).toBeDefined();
    if (fault === undefined) {
      return;
    }
    const errorMsg = PaymentController.getFaultCodeCategory(
      fault.faultCode,
      fault.description,
      fault.originalFaultCode
    );
    expect(errorMsg).toBeDefined();
    expect(errorMsg).toEqual(FaultCategoryEnum.PAYMENT_DUPLICATED);
  });

  it("should convert a KO Completed Error", () => {
    const fault = MockedData.aVerificaRPTOutputKOCompleted.fault;
    expect(fault).toBeDefined();
    if (fault === undefined) {
      return;
    }
    const errorMsg = PaymentController.getFaultCodeCategory(
      fault.faultCode,
      fault.description,
      fault.originalFaultCode
    );
    expect(errorMsg).toBeDefined();
    expect(errorMsg).toEqual(FaultCategoryEnum.PAYMENT_DUPLICATED);
    expect(fault.originalFaultCode).toEqual("PAA_PAGAMENTO_DUPLICATO");
  });

  it("should convert a KO Completed Error", () => {
    const fault = MockedData.aVerificaRPTOutputKOCompleted.fault;
    expect(fault).toBeDefined();
    if (fault === undefined) {
      return;
    }
    const errorMsg = PaymentController.getFaultCodeCategory(
      "",
      `FaultCode PA: ${
        fault.originalFaultCode
      } FaultString PA: Pagamento in attesa risulta in corso all’Ente Creditore. Description PA: `
    );
    expect(errorMsg).toBeDefined();
    expect(errorMsg).toEqual(FaultCategoryEnum.PAYMENT_DUPLICATED);
    expect(fault.originalFaultCode).toEqual("PAA_PAGAMENTO_DUPLICATO");
  });

  it("should convert a KO Expired Error", () => {
    const fault = MockedData.aVerificaRPTOutputKOExpired.fault;
    expect(fault).toBeDefined();
    if (fault === undefined) {
      return;
    }
    const errorMsg = PaymentController.getFaultCodeCategory(
      fault.faultCode,
      fault.description,
      fault.originalFaultCode
    );
    expect(errorMsg).toBeDefined();
    expect(errorMsg).toEqual(FaultCategoryEnum.PAYMENT_EXPIRED);
    expect(fault.originalFaultCode).toEqual("PAA_PAGAMENTO_SCADUTO");
  });
  it("should convert a KO Expired Error", () => {
    const fault = MockedData.aVerificaRPTOutputKOExpired.fault;
    expect(fault).toBeDefined();
    if (fault === undefined) {
      return;
    }
    const errorMsg = PaymentController.getFaultCodeCategory(
      "",
      `FaultCode PA: ${
        fault.originalFaultCode
      } FaultString PA: Pagamento in attesa risulta in corso all’Ente Creditore. Description PA: `
    );
    expect(errorMsg).toBeDefined();
    expect(errorMsg).toEqual(FaultCategoryEnum.PAYMENT_EXPIRED);
    expect(fault.originalFaultCode).toEqual("PAA_PAGAMENTO_SCADUTO");
  });

  it("should convert a KO OnGoing Error", () => {
    const fault = MockedData.aVerificaRPTOutputKOOnGoing.fault;
    expect(fault).toBeDefined();
    if (fault === undefined) {
      return;
    }
    const errorMsg = PaymentController.getFaultCodeCategory(
      fault.faultCode,
      fault.description,
      fault.originalFaultCode
    );
    expect(errorMsg).toBeDefined();
    expect(errorMsg).toEqual(FaultCategoryEnum.PAYMENT_ONGOING);
    expect(fault.originalFaultCode).toEqual("PAA_PAGAMENTO_IN_CORSO");
  });
  it("should convert a KO OnGoing Error", () => {
    const fault = MockedData.aVerificaRPTOutputKOOnGoing.fault;
    expect(fault).toBeDefined();
    if (fault === undefined) {
      return;
    }
    const errorMsg = PaymentController.getFaultCodeCategory(
      "",
      `FaultCode PA:  ${
        fault.originalFaultCode
      } FaultString PA: Pagamento in attesa risulta in corso all’Ente Creditore. Description PA: `
    );
    expect(errorMsg).toBeDefined();
    expect(errorMsg).toEqual(FaultCategoryEnum.PAYMENT_ONGOING);
    expect(fault.originalFaultCode).toEqual("PAA_PAGAMENTO_IN_CORSO");
  });
  it("should convert a KO Generic Error", () => {
    const fault = MockedData.aVerificaRPTOutputKOGeneric.fault;
    expect(fault).toBeDefined();
    if (fault === undefined) {
      return;
    }
    const errorMsg = PaymentController.getFaultCodeCategory(
      fault.faultCode,
      fault.description,
      fault.originalFaultCode
    );
    expect(errorMsg).toBeDefined();
    expect(errorMsg).toEqual(FaultCategoryEnum.GENERIC_ERROR);
    expect(fault.originalFaultCode).toEqual("PAA_CANALE_RICHIEDENTE_ERRATO");
  });
  it("should convert a KO Generic Error", () => {
    const fault = MockedData.aVerificaRPTOutputKOGeneric.fault;
    expect(fault).toBeDefined();
    if (fault === undefined) {
      return;
    }
    const errorMsg = PaymentController.getFaultCodeCategory(
      "",
      `FaultCode PA:  ${
        fault.originalFaultCode
      } FaultString PA: Pagamento in attesa risulta in corso all’Ente Creditore. Description PA: `
    );
    expect(errorMsg).toBeDefined();
    expect(errorMsg).toEqual(FaultCategoryEnum.GENERIC_ERROR);
    expect(fault.originalFaultCode).toEqual("PAA_CANALE_RICHIEDENTE_ERRATO");
  });
})

describe("getActivateIOPaymentResponse", () => {
  it("should convert activateIOPaymentRes_nfpsp with valid Ente in PaymentActivationsPostResponse", () => {
    const errorOrPaymentActivationsPostResponse = PaymentsConverter.getActivateIOPaymentResponse(
      MockedData.activateIOPaymentResOutputWhithEnte
    );
    expect(isRight(errorOrPaymentActivationsPostResponse)).toBeTruthy();
    if (!isRight(errorOrPaymentActivationsPostResponse)) {
      return;
    }
    expect(
      errorOrPaymentActivationsPostResponse.right.importoSingoloVersamento
    ).toBe(10000);
    expect(
      errorOrPaymentActivationsPostResponse.right.enteBeneficiario
        ? errorOrPaymentActivationsPostResponse.right.enteBeneficiario
            .denominazioneBeneficiario
        : undefined
    ).toBe("denominazione");
    expect(
      errorOrPaymentActivationsPostResponse.right.enteBeneficiario
        ? errorOrPaymentActivationsPostResponse.right.enteBeneficiario
            .identificativoUnivocoBeneficiario
        : undefined
    ).toBe("77777777777");
  });

  it("should convert activateIOPaymentRes_nfpsp with invalid Ente in PaymentActivationsPostResponse", () => {
    const errorOrPaymentActivationsPostResponse = PaymentsConverter.getActivateIOPaymentResponse(
      MockedData.activateIOPaymentResOutputWhithInvalidEnte
    );
    expect(isRight(errorOrPaymentActivationsPostResponse)).toBeTruthy();
    if (!isRight(errorOrPaymentActivationsPostResponse)) {
      return;
    }
    expect(
      errorOrPaymentActivationsPostResponse.right.importoSingoloVersamento
    ).toBe(10000);
    expect(
      errorOrPaymentActivationsPostResponse.right.enteBeneficiario
        ? errorOrPaymentActivationsPostResponse.right.enteBeneficiario
            .denominazioneBeneficiario
        : undefined
    ).toBeUndefined();
    expect(
      errorOrPaymentActivationsPostResponse.right.enteBeneficiario
        ? errorOrPaymentActivationsPostResponse.right.enteBeneficiario
            .identificativoUnivocoBeneficiario
        : undefined
    ).toBeUndefined();
  });

  it("should convert activateIOPaymentRes_nfpsp without Ente in getActivateIOPaymentResponse", () => {
    const errorOrPaymentActivationsPostResponse = PaymentsConverter.getActivateIOPaymentResponse(
      MockedData.activateIOPaymentResOutputWhitoutEnte
    );
    expect(isRight(errorOrPaymentActivationsPostResponse)).toBeTruthy();
    if (!isRight(errorOrPaymentActivationsPostResponse)) {
      return;
    }
    expect(
      errorOrPaymentActivationsPostResponse.right.importoSingoloVersamento
    ).toBe(10000);
    expect(
      errorOrPaymentActivationsPostResponse.right.enteBeneficiario
        ? errorOrPaymentActivationsPostResponse.right.enteBeneficiario
            .denominazioneBeneficiario
        : undefined
    ).toBeUndefined();
    expect(
      errorOrPaymentActivationsPostResponse.right.enteBeneficiario
        ? errorOrPaymentActivationsPostResponse.right.enteBeneficiario
            .identificativoUnivocoBeneficiario
        : undefined
    ).toBeUndefined();
  });
});

describe("getPaymentNoticeNumberAsString", () => {
  it("should convert paymentNoticeNumber as string with auxDigit 0", () => {
    const noticeNumber =  {
      applicationCode: "12" as ApplicationCode,
      auxDigit: "0" as AuxDigit,
      checkDigit: "00" as CheckDigit,
      iuv13: "1234567890123" as IUV13
    } as PaymentNoticeNumber

    const noticeNumberAsString = PaymentsConverter.getPaymentNoticeNumberAsString(
      noticeNumber
    );
   
    expect(noticeNumberAsString).toBe("012123456789012300");
  });

  it("should convert paymentNoticeNumber as string with auxDigit 1", () => {
    const noticeNumber =  {
      applicationCode: "12" as ApplicationCode,
      auxDigit: "1" as AuxDigit,
      checkDigit: "00" as CheckDigit,
      iuv17: "1234567890123" as IUV17
    } as PaymentNoticeNumber

    const noticeNumberAsString = PaymentsConverter.getPaymentNoticeNumberAsString(
      noticeNumber
    );
   
    expect(noticeNumberAsString).toBe("11234567890123");
  });

  it("should convert paymentNoticeNumber as string with auxDigit 3", () => {
    const noticeNumber =  {
      applicationCode: "12" as ApplicationCode,
      auxDigit: "2" as AuxDigit,
      checkDigit: "00" as CheckDigit,
      iuv15: "1234567890123" as IUV15
    } as PaymentNoticeNumber

    const noticeNumberAsString = PaymentsConverter.getPaymentNoticeNumberAsString(
      noticeNumber
    );
   
    expect(noticeNumberAsString).toBe("2123456789012300");
  });

  it("should convert paymentNoticeNumber as string with auxDigit 3", () => {
    const noticeNumber =  {
      applicationCode: "12" as ApplicationCode,
      auxDigit: "3" as AuxDigit,
      checkDigit: "00" as CheckDigit,
      iuv13: "1234567890123" as IUV13,
      segregationCode: 0
    } as PaymentNoticeNumber

    const noticeNumberAsString = PaymentsConverter.getPaymentNoticeNumberAsString(
      noticeNumber
    );
   
    expect(noticeNumberAsString).toBe("30123456789012300");
  });
});