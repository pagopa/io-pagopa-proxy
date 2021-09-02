import { RptId } from "italia-pagopa-commons/lib/pagopa";
import { reporters } from "italia-ts-commons";
import { CodiceContestoPagamento } from "../../../generated/api/CodiceContestoPagamento";
import { PaymentActivationsPostRequest } from "../../../generated/api/PaymentActivationsPostRequest";
import { ctSpezzoniCausaleVersamento_ppt } from "../../../generated/PagamentiTelematiciPspNodoservice/ctSpezzoniCausaleVersamento_ppt";
import { esitoNodoAttivaRPTRisposta_ppt } from "../../../generated/PagamentiTelematiciPspNodoservice/esitoNodoAttivaRPTRisposta_ppt";
import { esitoNodoVerificaRPTRisposta_ppt } from "../../../generated/PagamentiTelematiciPspNodoservice/esitoNodoVerificaRPTRisposta_ppt";
import { PagoPAConfig } from "../../Configuration";

// tslint:disable:no-identical-functions

export const aVerificaRPTOutput = esitoNodoVerificaRPTRisposta_ppt
  .decode({
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

export const aVerificaRPTOutputKOGeneric = esitoNodoVerificaRPTRisposta_ppt
  .decode({
    esito: "KO",
    fault: {
      id: "NodoDeiPagamentiSPC",
      faultCode: "PPT_DOMINIO_SCONOSCIUTO",
      faultString: "Identificativo richiedente non valido."
    }
  })
  .getOrElseL(errors => {
    throw Error(
      `Invalid esitoNodoVerificaRPTRisposta_ppt to decode: ${reporters.readableReport(
        errors
      )}`
    );
  });

export const aVerificaRPTOutputKOCompleted = esitoNodoVerificaRPTRisposta_ppt
  .decode({
    esito: "KO",
    fault: {
      id: "NodoDeiPagamentiSP",
      faultCode: "PPT_EMESSO_DA_PAA",
      faultString: "Errore emesso da Entre Creditore",
      originalFaultCode: "PAA_PAGAMENTO_DUPLICATO",
      originalFaultString: "Pagamento duplicato."
    }
  })
  .getOrElseL(errors => {
    throw Error(
      `Invalid esitoNodoVerificaRPTRisposta_ppt to decode: ${reporters.readableReport(
        errors
      )}`
    );
  });

export const aVerificaRPTOutputKOOnGoing = esitoNodoVerificaRPTRisposta_ppt
  .decode({
    esito: "KO",
    fault: {
      id: "NodoDeiPagamentiSPC",
      faultCode: "PPT_EMESSO_DA_PAA",
      faultString: "Errore emesso da Ente Creditore",
      originalFaultCode: "PAA_PAGAMENTO_IN_CORSO",
      originalFaultString:
        "Pagamento in attesa risulta in corso all'Ente Creditore"
    }
  })
  .getOrElseL(errors => {
    throw Error(
      `Invalid esitoNodoVerificaRPTRisposta_ppt to decode: ${reporters.readableReport(
        errors
      )}`
    );
  });

export const aVerificaRPTOutputKOExpired = esitoNodoVerificaRPTRisposta_ppt
  .decode({
    esito: "KO",
    fault: {
      id: "NodoDeiPagamentiSPC",
      faultCode: "PPT_EMESSO_DA_PAA",
      faultString: "Errore emesso da Ente Creditore.",
      originalFaultCode: "PAA_PAGAMENTO_SCADUTO",
      originalFaultString: "Pagamento scaduto."
    }
  })
  .getOrElseL(errors => {
    throw Error(
      `Invalid esitoNodoVerificaRPTRisposta_ppt to decode: ${reporters.readableReport(
        errors
      )}`
    );
  });

export const anAttivaRPTOutput = esitoNodoAttivaRPTRisposta_ppt
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

export const aAttivaRPTOutputKOAmount = esitoNodoAttivaRPTRisposta_ppt
  .decode({
    esito: "KO",
    fault: {
      id: "NodoDeiPagamentiSPC",
      faultCode: "PPT_ERRORE_EMESSO_DA_PAA",
      faultString: "Errore emesso dall'Ente Creditore",
      originalFaultCode: "PAA_ATTIVA_RPT_IMPORTO_NON_VALIDO",
      orginalfaultString:
        "L’importo del pagamento in attesa non è congruente con il dato indicato dal PSP"
    }
  })
  .getOrElseL(errors => {
    throw Error(
      `Invalid esitoNodoAttivaRPTRisposta_ppt to decode: ${reporters.readableReport(
        errors
      )}`
    );
  });

export const aCodiceContestoPagamento: CodiceContestoPagamento = "8447a9f0746811e89a8d5d4209060ab0" as CodiceContestoPagamento;

export const iuv13 = "1234567890123";
export const iuv15 = "123456789012345";
export const iuv17 = "12345678901234567";
export const checkDigit = "12";
export const segregationCode = "12";
export const applicationCode = "12";

export const aRptId0 = RptId.decode({
  organizationFiscalCode: "12345678901",
  paymentNoticeNumber: {
    applicationCode,
    auxDigit: "0",
    checkDigit,
    iuv13
  }
}).getOrElseL(errors => {
  throw Error(`Invalid RptId to decode: ${reporters.readableReport(errors)}`);
});

export const aRptId1 = RptId.decode({
  organizationFiscalCode: "12345678901",
  paymentNoticeNumber: {
    auxDigit: "1",
    iuv17
  }
}).getOrElseL(errors => {
  throw Error(`Invalid RptId to decode: ${reporters.readableReport(errors)}`);
});

export const aRptId2 = RptId.decode({
  organizationFiscalCode: "12345678901",
  paymentNoticeNumber: {
    auxDigit: "2",
    checkDigit,
    iuv15
  }
}).getOrElseL(errors => {
  throw Error(`Invalid RptId to decode: ${reporters.readableReport(errors)}`);
});

export const aRptId3 = RptId.decode({
  organizationFiscalCode: "12345678901",
  paymentNoticeNumber: {
    auxDigit: "3",
    checkDigit,
    iuv13,
    segregationCode
  }
}).getOrElseL(errors => {
  throw Error(`Invalid RptId to decode: ${reporters.readableReport(errors)}`);
});

export const aPaymentActivationsPostRequest = PaymentActivationsPostRequest.decode(
  {
    rptId: "12345678901012123456789012312",
    importoSingoloVersamento: 9905,
    codiceContestoPagamento: aCodiceContestoPagamento
  }
).getOrElseL(errors => {
  throw Error(
    `Invalid PaymentActivationsPostRequest to decode: ${reporters.readableReport(
      errors
    )}`
  );
});

// Define a PagoPA Configuration for tests
export const aConfig = PagoPAConfig.decode({
  HOST: process.env.PAGOPA_HOST || "http://localhost",
  PORT: process.env.PAGOPA_PORT || 3001,
  CERT: process.env.PAGOPA_CERT || "fakecert",
  KEY: process.env.PAGOPA_KEY || "fakekey",
  CLIENT_TIMEOUT_MSEC: process.env.PAGOPA_TIMEOUT_MSEC || 60000,
  WS_SERVICES: {
    PAGAMENTI: "/PagamentiTelematiciPspNodoservice/"
  },
  IDENTIFIER: {
    IDENTIFICATIVO_PSP: "AGID_01",
    IDENTIFICATIVO_INTERMEDIARIO_PSP: "97735020584",
    IDENTIFICATIVO_CANALE: "97735020584_02",
    IDENTIFICATIVO_CANALE_PAGAMENTO: "97735020584_xx",
    PASSWORD: process.env.PAGOPA_PASSWORD || "nopassword"
  }
}).getOrElseL(errors => {
  throw Error(`Invalid configuration: ${reporters.readableReport(errors)}`);
});

export const aSpezzoniCausaleVersamento = ctSpezzoniCausaleVersamento_ppt
  .decode({
    spezzoniCausaleVersamento: ["RATA GENNAIO", "RATA FEBBRAIO"]
  })
  .getOrElseL(errors => {
    throw Error(`Invalid configuration: ${reporters.readableReport(errors)}`);
  });

export const aSpezzoniCausaleVersamentoStrutturato = ctSpezzoniCausaleVersamento_ppt
  .decode({
    spezzoniStrutturatoCausaleVersamento: [
      {
        causaleSpezzone: "RATA 1",
        importoSpezzone: 1000
      },
      {
        causaleSpezzone: "RATA 2",
        importoSpezzone: 500
      }
    ]
  })
  .getOrElseL(errors => {
    throw Error(`Invalid configuration: ${reporters.readableReport(errors)}`);
  });

export const aSpezzoniCausaleVersamentoStrutturatoForController = ctSpezzoniCausaleVersamento_ppt
  .decode({
    spezzoniStrutturatoCausaleVersamento: [
      {
        causaleSpezzone: "RATA 1",
        importoSpezzone: 100000
      },
      {
        causaleSpezzone: "RATA 2",
        importoSpezzone: 50000
      }
    ]
  })
  .getOrElseL(errors => {
    throw Error(`Invalid configuration: ${reporters.readableReport(errors)}`);
  });
