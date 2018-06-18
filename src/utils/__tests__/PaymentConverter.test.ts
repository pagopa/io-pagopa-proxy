import { isLeft, isRight } from "fp-ts/lib/Either";
import {
  codificaInfrastrutturaPSPEnum,
  InodoAttivaRPTOutput,
  InodoVerificaRPTOutput,
  PPTPortTypes
} from "italia-pagopa-api/dist/wsdl-lib/PagamentiTelematiciPspNodoservice/PPTPort";
import { NonNegativeNumber } from "italia-ts-commons/lib/numbers";
import { WithinRangeString } from "italia-ts-commons/lib/strings";
import { CONFIG as Config, PagoPaConfig } from "../../Configuration";
import {
  CodiceContestoPagamento,
  FiscalCode,
  Importo,
  IUV
} from "../../types/CommonTypes";
import { PaymentsActivationRequest } from "../../types/PaymentsActivationRequest";
import { PaymentsCheckRequest } from "../../types/PaymentsCheckRequest";
import {
  getPaymentsActivationRequestPagoPa,
  getPaymentsActivationResponse,
  getPaymentsCheckRequestPagoPa,
  getPaymentsCheckResponse
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
            importoSpezzone: 0
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
            importoSpezzone: 0
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

const aPaymentCheckRequestOk: PaymentsCheckRequest = {
  codiceIdRPT: {
    CF: "DVCMCD99D30E611V" as FiscalCode,
    AuxDigit: 0 as NonNegativeNumber,
    CodIUV: "010101010101010" as IUV,
    CodStazPA: "22"
  }
};

const aCodiceContestoPagamento: CodiceContestoPagamento = "12345" as WithinRangeString<
  1,
  35
>;

const aPaymentActivationRequest: PaymentsActivationRequest = {
  codiceIdRPT: {
    CF: "DVCMCD99D30E611V" as FiscalCode,
    AuxDigit: 0 as NonNegativeNumber,
    CodIUV: "010101010101010" as IUV,
    CodStazPA: "22"
  },
  importoSingoloVersamento: 99.05 as Importo,
  codiceContestoPagamento: aCodiceContestoPagamento
};

const aConfig = {
  HOST: process.env.PAGOPA_HOST || "http://localhost",
  PORT: process.env.PAGOPA_PORT || "3001",
  SERVICES: {
    PAYMENTS_CHECK: "nodoVerificaRPT",
    PAYMENTS_ACTIVATION: "nodoAttivaRPT"
  },
  // These information will identify our system when it will access to PagoPa
  IDENTIFIER: {
    IDENTIFICATIVO_PSP: "AGID_01",
    IDENTIFICATIVO_INTERMEDIARIO_PSP: "97735020584",
    IDENTIFICATIVO_CANALE: "97735020584_02",
    TOKEN: process.env.PAGOPA_TOKEN || "ND"
  }
};

describe("getPaymentsCheckRequestPagoPa", () => {
  it("should convert PaymentCheckRequest to InodoVerificaRPTInput", async () => {
    const errorOrNodoVerificaRPTInput = getPaymentsCheckRequestPagoPa(
      aConfig as PagoPaConfig,
      aPaymentCheckRequestOk,
      aCodiceContestoPagamento
    );
    expect(isRight(errorOrNodoVerificaRPTInput)).toBeTruthy();
    expect(errorOrNodoVerificaRPTInput.value).toMatchObject({
      codiceContestoPagamento: "12345"
    });
    expect(errorOrNodoVerificaRPTInput.value).toMatchObject({
      codificaInfrastrutturaPSP: "QR-CODE"
    });
    expect(errorOrNodoVerificaRPTInput.value).toMatchObject({
      identificativoCanale: "97735020584_02"
    });
    expect(errorOrNodoVerificaRPTInput.value).toMatchObject({
      identificativoIntermediarioPSP: "97735020584"
    });
    expect(errorOrNodoVerificaRPTInput.value).toMatchObject({
      identificativoPSP: "AGID_01"
    });
    expect(errorOrNodoVerificaRPTInput.value).toMatchObject({
      password: "ND" //tslint:disable-line
    });
  });
});

describe("getPaymentsCheckResponse", () => {
  it("should convert InodoVerificaRPTOutput to PaymentsCheckResponse", () => {
    const errorOrPaymentCheckResponse = getPaymentsCheckResponse(
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
      99.05
    );
    expect(errorOrPaymentCheckResponse.value).toHaveProperty(
      "codiceContestoPagamento",
      "12345"
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
            importoSpezzone: 99.05
          }
        }
      ]
    });
  });

  it("should not convert to PaymentsCheckResponse (wrong importo) ", () => {
    const errorOrPaymentCheckResponse = getPaymentsCheckResponse(
      aVerificaRPTOutputKoImporto,
      aCodiceContestoPagamento
    );
    expect(isLeft(errorOrPaymentCheckResponse)).toBeTruthy();
  });

  it("should not convert to PaymentsCheckResponse (wrong iban)", () => {
    const errorOrPaymentCheckResponse = getPaymentsCheckResponse(
      aVerificaRPTOutputKoIban,
      aCodiceContestoPagamento
    );
    expect(isLeft(errorOrPaymentCheckResponse)).toBeTruthy();
  });
});

describe("getPaymentsActivationRequestPagoPa", () => {
  it("should convert PaymentsActivationRequest to InodoAttivaRPTInput", () => {
    const errorOrNodoAttivaRPTInput = getPaymentsActivationRequestPagoPa(
      aConfig as PagoPaConfig,
      aPaymentActivationRequest
    );
    expect(isRight(errorOrNodoAttivaRPTInput)).toBeTruthy();
    expect(errorOrNodoAttivaRPTInput.value).toMatchObject({
      codiceIdRPT: {
        CF: "DVCMCD99D30E611V" as FiscalCode,
        AuxDigit: "0",
        CodIUV: "010101010101010" as IUV,
        CodStazPA: "22"
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
      getPaymentsActivationResponse(anAttivaRPTOutputOk).isRight()
    ).toBeTruthy();
  });
  it("should not convert to PaymentsActivationResponse (wrong importo)", () => {
    expect(
      getPaymentsActivationResponse(anAttivaRPTOutputKoImporto).isLeft()
    ).toBeTruthy();
  });
  it("should not convert to PaymentsActivationResponse (wrong iban)", () => {
    expect(
      getPaymentsActivationResponse(anAttivaRPTOutputKoIban).isLeft()
    ).toBeTruthy();
  });
});
