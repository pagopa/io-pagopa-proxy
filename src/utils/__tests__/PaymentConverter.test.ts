import { isLeft, isRight } from "fp-ts/lib/Either";
import {
  codificaInfrastrutturaPSPEnum,
  InodoAttivaRPTOutput,
  InodoVerificaRPTOutput,
  PPTPortTypes
} from "italia-pagopa-api/dist/wsdl-lib/PagamentiTelematiciPspNodoservice/PPTPort";
import {
  PaymentNoticeNumber,
  RptIdFromString
} from "italia-ts-commons/lib/pagopa";
import { OrganizationFiscalCode } from "italia-ts-commons/lib/strings";
import { CONFIG as Config, PagoPAConfig } from "../../Configuration";
import { CodiceContestoPagamento } from "../../types/api/CodiceContestoPagamento";
import { PaymentActivationsPostRequest } from "../../types/api/PaymentActivationsPostRequest";
import {
  getInodoAttivaRPTInput,
  getPaymentActivationsPostResponse,
  getPaymentRequestsGetResponse
} from "../PaymentsConverter";

const aVerificaRPTOutputOk: InodoVerificaRPTOutput = {
  nodoVerificaRPTRisposta: {
    fault: {
      faultCode: "01",
      faultString: "FAULTSTRING",
      id: "ID01",
      description: "FAULTDESCRIPTION",
      serial: 1
    },
    esito: PPTPortTypes.Esito.OK,
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
      causaleVersamento: "CAUSALE01",
      spezzoniCausaleVersamento: [
        {
          spezzoneCausaleVersamento: "SPEZZONE1",
          spezzoneStrutturatoCausaleVersamento: {
            causaleSpezzone: "CAUSALE01",
            importoSpezzone: 99.05
          }
        }
      ]
    }
  }
};

const aVerificaRPTOutputKoImporto: InodoVerificaRPTOutput = {
  nodoVerificaRPTRisposta: {
    fault: {
      faultCode: "01",
      faultString: "FAULTSTRING",
      id: "ID01",
      description: "FAULTDESCRIPTION",
      serial: 1
    },
    esito: PPTPortTypes.Esito.KO,
    datiPagamentoPA: {
      importoSingoloVersamento: 0,
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
      causaleVersamento: "CAUSALE01",
      spezzoniCausaleVersamento: [
        {
          spezzoneCausaleVersamento: "SPEZZONE1",
          spezzoneStrutturatoCausaleVersamento: {
            causaleSpezzone: "CAUSALE01",
            importoSpezzone: 9999999999
          }
        }
      ]
    }
  }
};

const aVerificaRPTOutputKoIban: InodoVerificaRPTOutput = {
  nodoVerificaRPTRisposta: {
    fault: {
      faultCode: "01",
      faultString: "FAULTSTRING",
      id: "ID01",
      description: "FAULTDESCRIPTION",
      serial: 1
    },
    esito: PPTPortTypes.Esito.KO,
    datiPagamentoPA: {
      importoSingoloVersamento: 99.05,
      ibanAccredito: "XXX",
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
      causaleVersamento: "CAUSALE01",
      spezzoniCausaleVersamento: [
        {
          spezzoneCausaleVersamento: "SPEZZONE1",
          spezzoneStrutturatoCausaleVersamento: {
            causaleSpezzone: "CAUSALE01",
            importoSpezzone: 99.05
          }
        }
      ]
    }
  }
};

const anAttivaRPTOutputOk: InodoAttivaRPTOutput = {
  nodoAttivaRPTRisposta: {
    fault: {
      faultCode: "01",
      faultString: "FAULTSTRING",
      id: "ID01",
      description: "FAULTDESCRIPTION",
      serial: 1
    },
    esito: PPTPortTypes.Esito.OK,
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
      causaleVersamento: "CAUSALE01",
      spezzoniCausaleVersamento: [
        {
          spezzoneCausaleVersamento: "SPEZZONE1",
          spezzoneStrutturatoCausaleVersamento: {
            causaleSpezzone: "CAUSALE01",
            importoSpezzone: 99.05
          }
        }
      ]
    }
  }
};

const anAttivaRPTOutputKoImporto: InodoAttivaRPTOutput = {
  nodoAttivaRPTRisposta: {
    fault: {
      faultCode: "01",
      faultString: "FAULTSTRING",
      id: "ID01",
      description: "FAULTDESCRIPTION",
      serial: 1
    },
    esito: PPTPortTypes.Esito.KO,
    datiPagamentoPA: {
      importoSingoloVersamento: 9999999999,
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
      causaleVersamento: "CAUSALE01",
      spezzoniCausaleVersamento: [
        {
          spezzoneCausaleVersamento: "SPEZZONE1",
          spezzoneStrutturatoCausaleVersamento: {
            causaleSpezzone: "CAUSALE01",
            importoSpezzone: 9999999999
          }
        }
      ]
    }
  }
};

const anAttivaRPTOutputKoIban: InodoAttivaRPTOutput = {
  nodoAttivaRPTRisposta: {
    fault: {
      faultCode: "01",
      faultString: "FAULTSTRING",
      id: "ID01",
      description: "FAULTDESCRIPTION",
      serial: 1
    },
    esito: PPTPortTypes.Esito.KO,
    datiPagamentoPA: {
      importoSingoloVersamento: 99.05,
      ibanAccredito: "XXX",
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
      causaleVersamento: "CAUSALE01",
      spezzoniCausaleVersamento: [
        {
          spezzoneCausaleVersamento: "SPEZZONE1",
          spezzoneStrutturatoCausaleVersamento: {
            causaleSpezzone: "CAUSALE01",
            importoSpezzone: 99.05
          }
        }
      ]
    }
  }
};

const aCodiceContestoPagamento: CodiceContestoPagamento = "8447a9f0-7468-11e8-9a8d-5d4209060ab0" as CodiceContestoPagamento;

const aPaymentActivationsPostRequest0 = PaymentActivationsPostRequest.decode({
  rptId: RptIdFromString.encode({
    organizationFiscalCode: "12345678901" as OrganizationFiscalCode,
    paymentNoticeNumber: {
      applicationCode: "12",
      auxDigit: "0",
      checkDigit: "12",
      iuv13: "1234567890123"
    } as PaymentNoticeNumber
  }),
  importoSingoloVersamento: 9905,
  codiceContestoPagamento: aCodiceContestoPagamento
}).getOrElseL(() => {
  throw new Error();
});

const aPaymentActivationsPostRequest1 = PaymentActivationsPostRequest.decode({
  rptId: RptIdFromString.encode({
    organizationFiscalCode: "12345678901" as OrganizationFiscalCode,
    paymentNoticeNumber: {
      auxDigit: "1",
      iuv17: "12345678901234567"
    } as PaymentNoticeNumber
  }),
  importoSingoloVersamento: 9905,
  codiceContestoPagamento: aCodiceContestoPagamento
}).getOrElseL(() => {
  throw new Error();
});

const aPaymentActivationsPostRequest2 = PaymentActivationsPostRequest.decode({
  rptId: RptIdFromString.encode({
    organizationFiscalCode: "12345678901" as OrganizationFiscalCode,
    paymentNoticeNumber: {
      auxDigit: "2",
      checkDigit: "12",
      iuv15: "123456789012345"
    } as PaymentNoticeNumber
  }),
  importoSingoloVersamento: 9905,
  codiceContestoPagamento: aCodiceContestoPagamento
}).getOrElseL(() => {
  throw new Error();
});

const aPaymentActivationsPostRequest3 = PaymentActivationsPostRequest.decode({
  rptId: RptIdFromString.encode({
    organizationFiscalCode: "12345678901" as OrganizationFiscalCode,
    paymentNoticeNumber: {
      auxDigit: "3",
      checkDigit: "12",
      iuv13: "1234567890123",
      segregationCode: "99"
    } as PaymentNoticeNumber
  }),
  importoSingoloVersamento: 9905,
  codiceContestoPagamento: aCodiceContestoPagamento
}).getOrElseL(() => {
  throw new Error();
});

const aConfig = {
  HOST: process.env.PAGOPA_HOST || "http://localhost",
  PORT: process.env.PAGOPA_PORT || "3001",
  SERVICES: {
    VERIFICA_RPT: "nodoVerificaRPT",
    ATTIVA_RPT: "nodoAttivaRPT"
  },
  // These information will identify our system when it will access to PagoPA
  IDENTIFIER: {
    IDENTIFICATIVO_PSP: "AGID_01",
    IDENTIFICATIVO_INTERMEDIARIO_PSP: "97735020584",
    IDENTIFICATIVO_CANALE: "97735020584_02",
    TOKEN: process.env.PAGOPA_TOKEN || "ND"
  }
};

describe("getPaymentsCheckResponse", () => {
  it("should convert InodoVerificaRPTOutput to PaymentsCheckResponse", () => {
    const errorOrPaymentCheckResponse = getPaymentRequestsGetResponse(
      aVerificaRPTOutputOk,
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

    expect(errorOrPaymentCheckResponse.value).toMatchObject({
      spezzoniCausaleVersamento: [
        {
          spezzoneCausaleVersamento: "SPEZZONE1",
          spezzoneStrutturatoCausaleVersamento: {
            causaleSpezzone: "CAUSALE01",
            importoSpezzone: 9905
          }
        }
      ]
    });
  });

  it("should not convert to PaymentsCheckResponse (wrong importo) ", () => {
    const errorOrPaymentCheckResponse = getPaymentRequestsGetResponse(
      aVerificaRPTOutputKoImporto,
      aCodiceContestoPagamento
    );
    expect(isLeft(errorOrPaymentCheckResponse)).toBeTruthy();
  });

  it("should not convert to PaymentsCheckResponse (wrong iban)", () => {
    const errorOrPaymentCheckResponse = getPaymentRequestsGetResponse(
      aVerificaRPTOutputKoIban,
      aCodiceContestoPagamento
    );
    expect(isLeft(errorOrPaymentCheckResponse)).toBeTruthy();
  });
});

describe("getPaymentsActivationRequestPagoPA", () => {
  it("should convert PaymentsActivationRequest to InodoAttivaRPTInput (case when Auxdigit is 0)", () => {
    const errorOrNodoAttivaRPTInput = getInodoAttivaRPTInput(
      aConfig as PagoPAConfig,
      aPaymentActivationsPostRequest0
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
      Config.PAGOPA.IDENTIFIER.TOKEN
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
      codificaInfrastrutturaPSPEnum.QR_CODE
    );
  });

  it("should convert PaymentsActivationRequest to InodoAttivaRPTInput (case when Auxdigit is 1)", () => {
    const errorOrNodoAttivaRPTInput = getInodoAttivaRPTInput(
      aConfig as PagoPAConfig,
      aPaymentActivationsPostRequest1
    );
    expect(isRight(errorOrNodoAttivaRPTInput)).toBeTruthy();
    expect(errorOrNodoAttivaRPTInput.value).toMatchObject({
      codiceIdRPT: {
        CF: "12345678901",
        AuxDigit: "1",
        CodIUV: "12345678901234567"
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
      Config.PAGOPA.IDENTIFIER.TOKEN
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
      codificaInfrastrutturaPSPEnum.QR_CODE
    );
  });

  it("should convert PaymentsActivationRequest to InodoAttivaRPTInput (case when Auxdigit is 2)", () => {
    const errorOrNodoAttivaRPTInput = getInodoAttivaRPTInput(
      aConfig as PagoPAConfig,
      aPaymentActivationsPostRequest2
    );
    expect(isRight(errorOrNodoAttivaRPTInput)).toBeTruthy();
    expect(errorOrNodoAttivaRPTInput.value).toMatchObject({
      codiceIdRPT: {
        CF: "12345678901",
        AuxDigit: "2",
        CodIUV: "123456789012345"
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
      Config.PAGOPA.IDENTIFIER.TOKEN
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
      codificaInfrastrutturaPSPEnum.QR_CODE
    );
  });

  it("should convert PaymentsActivationRequest to InodoAttivaRPTInput (case when Auxdigit is 3)", () => {
    const errorOrNodoAttivaRPTInput = getInodoAttivaRPTInput(
      aConfig as PagoPAConfig,
      aPaymentActivationsPostRequest3
    );
    expect(isRight(errorOrNodoAttivaRPTInput)).toBeTruthy();
    expect(errorOrNodoAttivaRPTInput.value).toMatchObject({
      codiceIdRPT: {
        CF: "12345678901",
        AuxDigit: "3",
        CodIUV: "1234567890123"
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
      Config.PAGOPA.IDENTIFIER.TOKEN
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
      codificaInfrastrutturaPSPEnum.QR_CODE
    );
  });
});

describe("getPaymentsActivationResponse", () => {
  it("Should convert InodoAttivaRPTOutput in PaymentsActivationResponse", () => {
    expect(
      getPaymentActivationsPostResponse(anAttivaRPTOutputOk).isRight()
    ).toBeTruthy();
  });
  it("should not convert to PaymentsActivationResponse (wrong importo)", () => {
    expect(
      isLeft(getPaymentActivationsPostResponse(anAttivaRPTOutputKoImporto))
    ).toBeTruthy();
  });
  it("should not convert to PaymentsActivationResponse (wrong iban)", () => {
    expect(
      isLeft(getPaymentActivationsPostResponse(anAttivaRPTOutputKoIban))
    ).toBeTruthy();
  });
});
