import { reporters } from "@pagopa/ts-commons";
import { pipe } from "fp-ts/lib/function";
import { CodiceContestoPagamento } from "../../../generated/api/CodiceContestoPagamento";
import { PaymentActivationsPostRequest } from "../../../generated/api/PaymentActivationsPostRequest";
import { ctSpezzoniCausaleVersamento_type_ppt } from "../../../generated/PagamentiTelematiciPspNodoservice/ctSpezzoniCausaleVersamento_type_ppt";
import { esitoNodoAttivaRPTRisposta_type_ppt } from "../../../generated/PagamentiTelematiciPspNodoservice/esitoNodoAttivaRPTRisposta_type_ppt";
import { esitoNodoVerificaRPTRisposta_type_ppt } from "../../../generated/PagamentiTelematiciPspNodoservice/esitoNodoVerificaRPTRisposta_type_ppt";
import { PagoPAConfig } from "../../Configuration";
import * as E from "fp-ts/Either";
import { RptId } from "../pagopa";
import { activateIOPaymentRes_element_nfpsp } from "../../../generated/nodeNm3io/activateIOPaymentRes_element_nfpsp";
import { ValidationError } from "io-ts";

// tslint:disable:no-identical-functions

export const aVerificaRPTOutput = pipe(
  esitoNodoVerificaRPTRisposta_type_ppt.decode({
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
  }),
  E.getOrElseW(errors => {
    throw Error(
      `Invalid esitoNodoVerificaRPTRisposta_type_ppt to decode: ${reporters.readableReport(
        errors
      )}`
    );
  }));

export const aVerificaRPTOutputKOGeneric = pipe(
  esitoNodoVerificaRPTRisposta_type_ppt.decode({
    esito: "KO",
    fault: {
      id: "NodoDeiPagamentiSPC",
      faultCode: "CANALE_RICHIEDENTE_ERRATO",
      faultString: "Identificativo richiedente non valido.",
      originalFaultCode: "PAA_CANALE_RICHIEDENTE_ERRATO"
    }
  }),
  E.getOrElseW(errors => {
    throw Error(
      `Invalid esitoNodoVerificaRPTRisposta_type_ppt to decode: ${reporters.readableReport(
        errors
      )}`
    );
  }));

export const aVerificaRPTOutputKOShort = pipe(
  esitoNodoVerificaRPTRisposta_type_ppt.decode({
    esito: "KO",
    fault: {
      id: "NodoDeiPagamentiSPC",
      faultCode: "PPT_ERRORE_EMESSO_DA_PAA",
      description:
        "Pagamento PAA_PAGAMENTO_DUPLICATO in attesa risulta concluso all’Ente Creditore.",
      faultString: "Errore restituito dall’ente creditore"
    }
  }),
  E.getOrElseW(errors => {
    throw Error(
      `Invalid esitoNodoVerificaRPTRisposta_type_ppt to decode: ${reporters.readableReport(
        errors
      )}`
    );
  }));
    
export const aVerificaRPTOutputKOCompleted = pipe(
  esitoNodoVerificaRPTRisposta_type_ppt.decode({
    esito: "KO",
    fault: {
      id: "NodoDeiPagamentiSPC",
      faultCode: "PPT_ERRORE_EMESSO_DA_PAA",
      description: "Pagamento in attesa risulta concluso all’Ente Creditore.",
      faultString: "Errore restituito dall’ente creditore",
      originalFaultCode: "PAA_PAGAMENTO_DUPLICATO"
    }
  }),
  E.getOrElseW(errors => {
    throw Error(
      `Invalid esitoNodoVerificaRPTRisposta_type_ppt to decode: ${reporters.readableReport(
        errors
      )}`
    );
  }));

export const aVerificaRPTOutputKOOnGoing = pipe(
  esitoNodoVerificaRPTRisposta_type_ppt.decode({
    esito: "KO",
    fault: {
      id: "NodoDeiPagamentiSPC",
      faultCode: "PPT_ERRORE_EMESSO_DA_PAA",
      faultString: "Pagamento in attesa risulta in corso all’Ente Creditore.",
      originalFaultCode: "PAA_PAGAMENTO_IN_CORSO"
    }
  }),
  E.getOrElseW(errors => {
    throw Error(
      `Invalid esitoNodoVerificaRPTRisposta_type_ppt to decode: ${reporters.readableReport(
        errors
      )}`
    );
  }));

export const aVerificaRPTOutputKOExpired = pipe(
  esitoNodoVerificaRPTRisposta_type_ppt.decode({
    esito: "KO",
    fault: {
      id: "NodoDeiPagamentiSPC",
      faultCode: "PPT_ERRORE_EMESSO_DA_PAA",
      faultString: "Pagamento in attesa risulta scaduto all’Ente Creditore.",
      originalFaultCode: "PAA_PAGAMENTO_SCADUTO"
    }
  }),
  E.getOrElseW(errors => {
    throw Error(
      `Invalid esitoNodoVerificaRPTRisposta_type_ppt to decode: ${reporters.readableReport(
        errors
      )}`
    );
  }));

export const aActivateKO = pipe(
  esitoNodoVerificaRPTRisposta_type_ppt.decode({
    esito: "KO",
    fault: {
      id: "NodoDeiPagamentiSPC",
      faultCode: "PPT_SINTASSI_EXTRAXSD",
      faultString: "Errore sintassi "
    }
  }),
  E.getOrElseW(errors => {
    throw Error(
      `Invalid esitoNodoVerificaRPTRisposta_type_ppt to decode: ${reporters.readableReport(
        errors
      )}`
    );
  }));

export const anAttivaRPTOutput = pipe(
  esitoNodoAttivaRPTRisposta_type_ppt.decode({
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
  }),
  E.getOrElseW(errors => {
    throw Error(
      `Invalid esitoNodoAttivaRPTRisposta_type_ppt to decode: ${reporters.readableReport(
        errors
      )}`
    );
  }));

export const aAttivaRPTOutputKOAmount = pipe(
  esitoNodoAttivaRPTRisposta_type_ppt.decode({
    esito: "KO",
    fault: {
      id: "NodoDeiPagamentiSPC",
      faultCode: "PAA_ATTIVA_RPT_IMPORTO_NON_VALIDO",
      faultString:
        "L’importo del pagamento in attesa non è congruente con il dato indicato dal PSP",
      originalFaultCode: "PAA_ATTIVA_RPT_IMPORTO_NON_VALIDO"
    }
  }),
  E.getOrElseW(errors => {
    throw Error(
      `Invalid esitoNodoAttivaRPTRisposta_type_ppt to decode: ${reporters.readableReport(
        errors
      )}`
    );
  }));

export const aAttivaRPTOutputKOGeneric = pipe(
  esitoNodoAttivaRPTRisposta_type_ppt.decode({
    esito: "KO",
    faultCode: "PAA_TIPOFIRMA_SCONOSCIUTO",
    faultString: "Il campo tipoFirma non corrisponde ad alcun valore previsto.",
    originalFaultCode: "PAA_TIPOFIRMA_SCONOSCIUTO"
  }),
  E.getOrElseW(errors => {
    throw Error(
      `Invalid esitoNodoAttivaRPTRisposta_type_ppt to decode: ${reporters.readableReport(
        errors
      )}`
    );
  }));

export const aVerificaRPTOutputKOPASystemError = pipe(
  esitoNodoVerificaRPTRisposta_type_ppt.decode({
    esito: "KO",
    fault: {
      id: "NodoDeiPagamentiSPC",
      faultCode: "PPT_ERRORE_EMESSO_DA_PAA",
      faultString: "Errore generico lato PA.",
      originalFaultCode: "PAA_SYSTEM_ERROR"
    }
  }),
  E.getOrElseW(errors => {
    throw Error(
      `Invalid esitoNodoVerificaRPTRisposta_type_ppt to decode: ${reporters.readableReport(
        errors
      )}`
    );
  }));

export const aVerificaRPTOutputKOPAUnknownError = pipe(
  esitoNodoVerificaRPTRisposta_type_ppt.decode({
    esito: "KO",
    fault: {
      id: "NodoDeiPagamentiSPC",
      faultCode: "PPT_ERRORE_EMESSO_DA_PAA",
      faultString: "Errore generico lato PA.",
      originalFaultCode: "PAA_UNK_ERROR"
    }
  }),
  E.getOrElseW(errors => {
    throw Error(
      `Invalid esitoNodoVerificaRPTRisposta_type_ppt to decode: ${reporters.readableReport(
        errors
      )}`
    );
  }));

export const aCodiceContestoPagamento: CodiceContestoPagamento = "8447a9f0746811e89a8d5d4209060ab0" as CodiceContestoPagamento;

export const iuv13 = "1234567890123";
export const iuv15 = "123456789012345";
export const iuv17 = "12345678901234567";
export const checkDigit = "12";
export const segregationCode = "12";
export const applicationCode = "12";

export const aRptId0 = pipe(
  RptId.decode({
    organizationFiscalCode: "12345678901",
    paymentNoticeNumber: {
      applicationCode,
      auxDigit: "0",
      checkDigit,
      iuv13
    }
  }),
  E.getOrElseW(errors => {
    throw Error(`Invalid RptId to decode: ${reporters.readableReport(errors)}`);
  }));

export const aRptId1 = pipe(
    RptId.decode({
      organizationFiscalCode: "12345678901",
      paymentNoticeNumber: {
        auxDigit: "1",
        iuv17
      }
    }),
    E.getOrElseW(errors => {
      throw Error(`Invalid RptId to decode: ${reporters.readableReport(errors)}`);
    })
  );

export const aRptId2 = pipe(
  RptId.decode({
    organizationFiscalCode: "12345678901",
    paymentNoticeNumber: {
      auxDigit: "2",
      checkDigit,
      iuv15
    }
  }),
  E.getOrElseW(errors => {
    throw Error(`Invalid RptId to decode: ${reporters.readableReport(errors)}`);
  })
);

export const aRptId3 = pipe(
  RptId.decode({
    organizationFiscalCode: "12345678901",
    paymentNoticeNumber: {
      auxDigit: "3",
      checkDigit,
      iuv13,
      segregationCode
    }
  }),
  E.getOrElseW(errors => {
    throw Error(`Invalid RptId to decode: ${reporters.readableReport(errors)}`);
  })
);

export const aPaymentActivationsPostRequest = pipe(
  PaymentActivationsPostRequest.decode(
    {
      rptId: "12345678901012123456789012312",
      importoSingoloVersamento: 9905,
      codiceContestoPagamento: aCodiceContestoPagamento
    }
  ),
  E.getOrElseW(errors => {
    throw Error(
      `Invalid PaymentActivationsPostRequest to decode: ${reporters.readableReport(
        errors
      )}`
    );
  })
);

export const MOCK_CLIENT_ID = "CLIENT_CHECKOUT";

// Define a PagoPA Configuration for tests
export const aConfig = pipe(
  PagoPAConfig.decode({
    HOST: process.env.PAGOPA_HOST || "http://localhost",
    PORT: process.env.PAGOPA_PORT || 3001,
    CERT: process.env.PAGOPA_CERT || "fakecert",
    KEY: process.env.PAGOPA_KEY || "fakekey",
    CLIENT_TIMEOUT_MSEC: process.env.PAGOPA_TIMEOUT_MSEC || 60000,
    WS_SERVICES: {
      PAGAMENTI: {
        NODO_PER_PSP: "/api/nodo-per-psp/v1",
        NODE_FOR_PSP: "/api/node-for-psp/v1",
        NODE_FOR_IO: "/api/node-for-io/v1"
      }
    },
    IDENTIFIERS: {
      CLIENT_IO: {
        IDENTIFICATIVO_PSP: "TEST_01",
        IDENTIFICATIVO_INTERMEDIARIO_PSP: "00735020584",
        IDENTIFICATIVO_CANALE: "00735020584_02",
        IDENTIFICATIVO_CANALE_PAGAMENTO: "00735020584_xx",
        PASSWORD: process.env.PAGOPA_PASSWORD || "nopassword"
      },
      CLIENT_CHECKOUT: {
        IDENTIFICATIVO_PSP: "TEST_01",
        IDENTIFICATIVO_INTERMEDIARIO_PSP: "00735020584",
        IDENTIFICATIVO_CANALE: "00735020584_02",
        IDENTIFICATIVO_CANALE_PAGAMENTO: "00735020584_xx",
        PASSWORD: process.env.PAGOPA_PASSWORD || "nopassword"
      }
    },
    APPINSIGHTS_DISABLE: "true",
    APPINSIGHTS_SAMPLING_PERCENTAGE: "100",
    APPINSIGHTS_INSTRUMENTATIONKEY: "key",
    NM3_ENABLED: true
  }),
  E.getOrElseW(errors => {
    throw Error(`Invalid configuration: ${reporters.readableReport(errors)}`);
  })
);

  export const aSpezzoniCausaleVersamento = pipe(
    ctSpezzoniCausaleVersamento_type_ppt.decode({
      spezzoniCausaleVersamento: ["RATA GENNAIO", "RATA FEBBRAIO"]
    }),
    E.getOrElseW(errors => {
      throw Error(`Invalid configuration: ${reporters.readableReport(errors)}`);
    })
  );

  export const aSpezzoniCausaleVersamentoStrutturato = pipe(
      ctSpezzoniCausaleVersamento_type_ppt.decode({
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
      }),
      E.getOrElseW(errors => {
        throw Error(`Invalid configuration: ${reporters.readableReport(errors)}`);
      })
    );

export const aSpezzoniCausaleVersamentoStrutturatoForController = pipe(ctSpezzoniCausaleVersamento_type_ppt
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
    }),
    E.getOrElseW(errors => {
      throw Error(`Invalid configuration: ${reporters.readableReport(errors)}`);
    })
  );

  export const activateIOPaymentResOutputWhitoutEnte = pipe(activateIOPaymentRes_element_nfpsp
  .decode({
    outcome: "OK",
    totalAmount: 100,
    paymentDescription: "Test causale senza ente"
  }),
  E.getOrElseW((errors: readonly ValidationError[]) => {
    throw Error(
      `Invalid activateIOPaymentRes_nfpsp to decode: ${reporters.readableReport(
        errors
      )}`
    );
  }));

export const activateIOPaymentResOutputWhithInvalidEnte = pipe(activateIOPaymentRes_element_nfpsp
  .decode({
    outcome: "OK",
    totalAmount: 100,
    paymentDescription: "Test causale",
    fiscalCodePA: "77777777777"
  }),
  E.getOrElseW((errors: readonly ValidationError[]) => {
    throw Error(
      `Invalid activateIOPaymentRes_nfpsp to decode: ${reporters.readableReport(
        errors
      )}`
    );
  }));

export const activateIOPaymentResOutputWhithEnte = pipe(activateIOPaymentRes_element_nfpsp
  .decode({
    outcome: "OK",
    totalAmount: 100,
    paymentDescription: "Test causale",
    fiscalCodePA: "77777777777",
    companyName: "denominazione"
  }),
  E.getOrElseW((errors: readonly ValidationError[]) => {
    throw Error(
      `Invalid activateIOPaymentRes_nfpsp to decode: ${reporters.readableReport(
        errors
      )}`
    );
  }));
