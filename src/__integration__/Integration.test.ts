import { PPTPortTypes } from "italia-pagopa-api/dist/wsdl-lib/PagamentiTelematiciPspNodoservice/PPTPort";

import { left } from "fp-ts/lib/Either";
import { IResponseSuccessJson } from "italia-ts-commons/lib/responses";
import "jest-xml-matcher";
import { PagoPaConfig } from "../Configuration";
import {
  activatePaymentToPagoPa,
  checkPaymentToPagoPa
} from "../controllers/restful/PaymentController";
import {
  CodiceContestoPagamento,
  FiscalCode,
  Importo,
  IUV
} from "../types/CommonTypes";
import { PaymentsActivationRequest } from "../types/controllers/PaymentsActivationRequest";
import { PaymentsActivationResponse } from "../types/controllers/PaymentsActivationResponse";
import { PaymentsCheckRequest } from "../types/controllers/PaymentsCheckRequest";
import { PaymentsCheckResponse } from "../types/controllers/PaymentsCheckResponse";
import {
  createPagamentiTelematiciPspNodoClient,
  FakePagamentiTelematiciPspNodoAsyncClient
} from "./fake/fakePagamentiTelematiciPspNodoAsyncClient";
import mockReq from "./fake/request";

const aConfig = {
  HOST: process.env.PAGOPA_HOST || "http://localhost",
  PORT: process.env.PAGOPA_PORT || "3001",
  SERVICES: {
    PAYMENTS_CHECK: "nodoVerificaRPT",
    PAYMENTS_ACTIVATION: "nodoAttivaRPT"
  },
  IDENTIFIER: {
    IDENTIFICATIVO_PSP: "AGID_01",
    IDENTIFICATIVO_INTERMEDIARIO_PSP: "97735020584",
    IDENTIFICATIVO_CANALE: "97735020584_02",
    TOKEN: process.env.PAGOPA_TOKEN || "ND"
  }
};

const aCodiceContestoPagamento = "05245c90-7468-11e8-b9bf-91897339427e" as CodiceContestoPagamento;

describe("checkPaymentToPagoPa", async () => {
  it("should return the right response", async () => {
    const aPaymentCheckRequest: PaymentsCheckRequest = {
      codiceIdRPT: {
        CF: "DVCMCD99D30E611V" as FiscalCode,
        AuxDigit: "0",
        CodIUV: "010101010101010" as IUV,
        CodStazPA: "22"
      }
    };

    const verificaRPTPagoPaClient = new FakePagamentiTelematiciPspNodoAsyncClient(
      await createPagamentiTelematiciPspNodoClient({
        envelopeKey: PPTPortTypes.envelopeKey
      })
    );

    const req = mockReq();

    req.params = aPaymentCheckRequest;

    const aPaymentCheckResponse = (await checkPaymentToPagoPa(
      aConfig as PagoPaConfig,
      verificaRPTPagoPaClient
    )(req)) as IResponseSuccessJson<PaymentsCheckResponse>;

    expect(aPaymentCheckResponse.kind).toBe("IResponseSuccessJson");
    expect(aPaymentCheckResponse.value).toHaveProperty(
      "importoSingoloVersamento",
      99.05
    );
    expect(aPaymentCheckResponse.value).toHaveProperty(
      "ibanAccredito",
      "IT17X0605502100000001234567"
    );
    expect(aPaymentCheckResponse.value).toHaveProperty(
      "causaleVersamento",
      "CAUSALE01"
    );
    expect(aPaymentCheckResponse.value).toMatchObject({
      enteBeneficiario: {
        codiceIdentificativoUnivoco: "001",
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
    expect(
      CodiceContestoPagamento.decode(
        aPaymentCheckResponse.value.codiceContestoPagamento
      )
    ).toBeTruthy();
  });

  it("should return error (invalid input)", async () => {
    const aPaymentCheckRequest: PaymentsCheckRequest = {
      codiceIdRPT: {
        CF: "XXX" as FiscalCode,
        AuxDigit: "0",
        CodIUV: "010101010101010" as IUV,
        CodStazPA: "22"
      }
    };

    const verificaRPTPagoPaClient = new FakePagamentiTelematiciPspNodoAsyncClient(
      await createPagamentiTelematiciPspNodoClient({
        envelopeKey: PPTPortTypes.envelopeKey
      })
    );

    const req = mockReq();

    req.params = aPaymentCheckRequest;

    const aPaymentCheckResponse = (await checkPaymentToPagoPa(
      aConfig as PagoPaConfig,
      verificaRPTPagoPaClient
    )(req)) as IResponseSuccessJson<PaymentsCheckResponse>;

    expect(left(aPaymentCheckResponse)).toBeTruthy();
    expect(aPaymentCheckResponse.kind).toBe("IResponseErrorValidation");
  });
});

describe("activatePaymentToPagoPa", async () => {
  it("should return the right response", async () => {
    const aPaymentActivationRequest: PaymentsActivationRequest = {
      codiceIdRPT: {
        CF: "DVCMCD99D30E611V" as FiscalCode,
        AuxDigit: "0",
        CodIUV: "010101010101010" as IUV,
        CodStazPA: "22"
      },
      importoSingoloVersamento: 99.05 as Importo,
      codiceContestoPagamento: aCodiceContestoPagamento
    };

    const attivaRPTPagoPaClient = new FakePagamentiTelematiciPspNodoAsyncClient(
      await createPagamentiTelematiciPspNodoClient({
        envelopeKey: PPTPortTypes.envelopeKey
      })
    );

    const req = mockReq();

    req.params = aPaymentActivationRequest;

    const aPaymentActivationResponse = (await activatePaymentToPagoPa(
      aConfig as PagoPaConfig,
      attivaRPTPagoPaClient
    )(req)) as IResponseSuccessJson<PaymentsActivationResponse>;

    expect(aPaymentActivationResponse.kind).toBe("IResponseSuccessJson");
    expect(aPaymentActivationResponse.value).toHaveProperty(
      "importoSingoloVersamento",
      99.05
    );
    expect(aPaymentActivationResponse.value).toHaveProperty(
      "ibanAccredito",
      "IT17X0605502100000001234567"
    );
    expect(aPaymentActivationResponse.value).toHaveProperty(
      "causaleVersamento",
      "CAUSALE01"
    );
    expect(aPaymentActivationResponse.value).toMatchObject({
      enteBeneficiario: {
        capBeneficiario: "00000",
        civicoBeneficiario: "01",
        codiceUnitOperBeneficiario: "01",
        denomUnitOperBeneficiario: "DENOM01",
        denominazioneBeneficiario: "BANCA01",
        identificativoUnivocoBeneficiario: "001",
        indirizzoBeneficiario: "VIAROMA",
        localitaBeneficiario: "ROMA",
        nazioneBeneficiario: "IT",
        provinciaBeneficiario: "ROMA"
      }
    });
  });

  it("should return error (invalid input)", async () => {
    const aPaymentActivationRequest: PaymentsActivationRequest = {
      codiceIdRPT: {
        CF: "XXX" as FiscalCode,
        AuxDigit: "0",
        CodIUV: "010101010101010" as IUV,
        CodStazPA: "22"
      },
      importoSingoloVersamento: 99.05 as Importo,
      codiceContestoPagamento: aCodiceContestoPagamento
    };

    const attivaRPTPagoPaClient = new FakePagamentiTelematiciPspNodoAsyncClient(
      await createPagamentiTelematiciPspNodoClient({
        envelopeKey: PPTPortTypes.envelopeKey
      })
    );

    const req = mockReq();

    req.params = aPaymentActivationRequest;

    const aPaymentActivationResponse = (await activatePaymentToPagoPa(
      aConfig as PagoPaConfig,
      attivaRPTPagoPaClient
    )(req)) as IResponseSuccessJson<PaymentsActivationResponse>;

    expect(left(aPaymentActivationResponse)).toBeTruthy();
    expect(aPaymentActivationResponse.kind).toBe("IResponseErrorValidation");
  });
});
