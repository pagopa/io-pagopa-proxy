import { isLeft, isRight } from "fp-ts/lib/Either";
import {
  InodoAttivaRPTOutput,
  InodoVerificaRPTOutput,
  PPTPortTypes
} from "italia-pagopa-api/dist/wsdl-lib/PagamentiTelematiciPspNodoservice/PPTPort";
import { reporters } from "italia-ts-commons";
import { NonNegativeNumber } from "italia-ts-commons/lib/numbers";
import { WithinRangeString } from "italia-ts-commons/lib/strings";
import { CONFIG, Configuration } from "../../Configuration";
import { CodiceContestoPagamento } from "../../types/CodiceContestoPagamento";
import { FiscalCode } from "../../types/FiscalCode";
import { Importo } from "../../types/Importo";
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

const aPaymentCheckRequest: PaymentsCheckRequest = {
  codiceIdRPT: {
    CF: "DVCMCD99D30E611V" as FiscalCode,
    AuxDigit: 3 as NonNegativeNumber,
    CodIUV: "010101010101010",
    CodStazPA: "22"
  }
};

const aPaymentActivationRequest: PaymentsActivationRequest = {
  codiceIdRPT: {
    CF: "DVCMCD99D30E611V" as FiscalCode,
    AuxDigit: 3 as NonNegativeNumber,
    CodIUV: "010101010101010",
    CodStazPA: "22"
  },
  importoSingoloVersamento: 99.05 as Importo,
  codiceContestoPagamento: "12345" as CodiceContestoPagamento
};

const aCodiceContestoPagamento: CodiceContestoPagamento = "12345" as WithinRangeString<
  1,
  35
>;

const aConfig = Configuration.decode(CONFIG).getOrElseL(errors => {
  throw Error(`Invalid configuration: ${reporters.readableReport(errors)}`);
});

describe(" Test getPaymentsCheckRequestPagoPa to convert PaymentCheckRequest to InodoVerificaRPTInput", () => {
  it("Should return an istance of InodoVerificaRPTInput ", () => {
    expect(
      isRight(
        getPaymentsCheckRequestPagoPa(
          aConfig.PAGOPA,
          aPaymentCheckRequest,
          aCodiceContestoPagamento
        )
      )
    ).toBeTruthy();
  });
});

describe(" Test getPaymentsCheckResponse to convert InodoVerificaRPTOutput in PaymentCheckResponse", () => {
  it("Should return an istance of PaymentCheckResponse", () => {
    expect(
      isRight(
        getPaymentsCheckResponse(aVerificaRPTOutputOk, aCodiceContestoPagamento)
      )
    ).toBeTruthy();
  });

  it("Should return input error (wrong importo)", () => {
    expect(
      isLeft(
        getPaymentsCheckResponse(
          aVerificaRPTOutputKoImporto,
          aCodiceContestoPagamento
        )
      )
    ).toBeTruthy();
  });

  it("Should return input error (wrong iban)", () => {
    expect(
      isLeft(
        getPaymentsCheckResponse(
          aVerificaRPTOutputKoIban,
          aCodiceContestoPagamento
        )
      )
    ).toBeTruthy();
  });
});

describe(" Test getPaymentsActivationRequestPagoPa to convert PaymentsActivationRequest in InodoAttivaRPTInput", () => {
  it("Should return an istance of InodoAttivaRPTInput", () => {
    expect(
      isRight(
        getPaymentsActivationRequestPagoPa(
          aConfig.PAGOPA,
          aPaymentActivationRequest
        )
      )
    ).toBeTruthy();
  });
});

describe(" Test getPaymentsActivationResponse to convert InodoAttivaRPTOutput in PaymentsActivationResponse", () => {
  it("Should return an istance of PaymentActivationResponse", () => {
    expect(
      getPaymentsActivationResponse(anAttivaRPTOutputOk).isRight()
    ).toBeTruthy();
  });
  it("Should return input error (wrong importo)", () => {
    expect(
      getPaymentsActivationResponse(anAttivaRPTOutputKoImporto).isLeft()
    ).toBeTruthy();
  });
  it("Should return input error (wrong iban)", () => {
    expect(
      getPaymentsActivationResponse(anAttivaRPTOutputKoIban).isLeft()
    ).toBeTruthy();
  });
});
