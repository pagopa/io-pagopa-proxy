// tslint:disable:no-duplicate-string
import { reporters } from "italia-ts-commons";
import { RptId } from "italia-ts-commons/lib/pagopa";
import { PagoPAConfig } from "../../Configuration";
import { CodiceContestoPagamento } from "../../types/api/CodiceContestoPagamento";
import { PaymentActivationsPostRequest } from "../../types/api/PaymentActivationsPostRequest";
import { SpezzoniCausaleVersamento } from "../../types/api/SpezzoniCausaleVersamento";
import { ctSpezzoniCausaleVersamento_ppt } from "../../types/pagopa_api/yaml-to-ts/ctSpezzoniCausaleVersamento_ppt";
import { esitoNodoAttivaRPTRisposta_ppt } from "../../types/pagopa_api/yaml-to-ts/esitoNodoAttivaRPTRisposta_ppt";
import { esitoNodoVerificaRPTRisposta_ppt } from "../../types/pagopa_api/yaml-to-ts/esitoNodoVerificaRPTRisposta_ppt";

export const aVerificaRPTOutput = esitoNodoVerificaRPTRisposta_ppt
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
    rptId: "12345678901012123456789012399",
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
  WS_SERVICES: {
    PAGAMENTI: "/PagamentiTelematiciPspNodoservice/"
  },
  IDENTIFIER: {
    IDENTIFICATIVO_PSP: "AGID_01",
    IDENTIFICATIVO_INTERMEDIARIO_PSP: "97735020584",
    IDENTIFICATIVO_CANALE: "97735020584_02",
    PASSWORD: process.env.PAGOPA_PASSWORD || "nopassword"
  }
}).getOrElseL(errors => {
  throw Error(`Invalid configuration: ${reporters.readableReport(errors)}`);
});

export const aSpezzoniCausaleVersamento = ctSpezzoniCausaleVersamento_ppt
  .decode([
    "RATA GENNAIO",
    "RATA FEBBRAIO",
    {
      causaleSpezzone: "RATA MARZO",
      importoSpezzone: 100.01
    },
    {
      causaleSpezzone: "RATA APRILE",
      importoSpezzone: 98.33
    },
    "RATA MAGGIO"
  ])
  .getOrElseL(errors => {
    throw Error(`Invalid configuration: ${reporters.readableReport(errors)}`);
  });

export const aSpezzoniCausaleVersamentoForController = SpezzoniCausaleVersamento.decode(
  [
    {
      causaleSpezzone: "RATA GENNAIO"
    },
    {
      causaleSpezzone: "RATA FEBBRAIO"
    },
    {
      causaleSpezzone: "RATA MARZO",
      importoSpezzone: 10001
    },
    {
      causaleSpezzone: "RATA APRILE",
      importoSpezzone: 9833
    },
    {
      causaleSpezzone: "RATA MAGGIO"
    }
  ]
).getOrElseL(errors => {
  throw Error(`Invalid configuration: ${reporters.readableReport(errors)}`);
});
