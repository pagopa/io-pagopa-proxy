import { isRight } from "fp-ts/lib/Either";
import { PPTPortTypes } from "italia-pagopa-api/dist/wsdl-lib/PagamentiTelematiciPspNodoservice/PPTPort";
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
import {
  createPagamentiTelematiciPspNodoClient,
  FakePagamentiTelematiciPspNodoAsyncClient
} from "./fake/fakePagamentiTelematiciPspNodoAsyncClient";
import mockReq from "./fake/request";

const aConfig = {
  HOST: process.env.PAGOPA_HOST || "http://localhost",
  PORT: process.env.PAGOPA_PORT || "3008",
  SERVICES: {
    PAYMENTS_CHECK: "nodoVerificaRPT",
    PAYMENTS_ACTIVATION: "nodoAttivaRPT"
  },
  IDENTIFIER: {
    IDENTIFICATIVO_PSP: "AGID_00",
    IDENTIFICATIVO_INTERMEDIARIO_PSP: "000000000000",
    IDENTIFICATIVO_CANALE: "000000000000_02",
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

    const errorOrPaymentCheckResponse = await checkPaymentToPagoPa(
      aConfig as PagoPaConfig,
      verificaRPTPagoPaClient
    )(req);

    expect(errorOrPaymentCheckResponse.kind).toBe("IResponseSuccessJson");
    if (errorOrPaymentCheckResponse.kind === "IResponseSuccessJson") {
      expect(errorOrPaymentCheckResponse.value).toHaveProperty(
        "importoSingoloVersamento",
        99.05
      );
      expect(errorOrPaymentCheckResponse.value).toHaveProperty(
        "ibanAccredito",
        "IT17X0605502100000001234567"
      );
      expect(errorOrPaymentCheckResponse.value).toHaveProperty(
        "causaleVersamento",
        "CAUSALE01"
      );
      expect(errorOrPaymentCheckResponse.value).toMatchObject({
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
        isRight(
          CodiceContestoPagamento.decode(
            errorOrPaymentCheckResponse.value.codiceContestoPagamento
          )
        )
      ).toBeTruthy();
    }
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

    const errorOrPaymentCheckResponse = await checkPaymentToPagoPa(
      aConfig as PagoPaConfig,
      verificaRPTPagoPaClient
    )(req);

    expect(errorOrPaymentCheckResponse.kind).toBe("IResponseErrorValidation");
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

    const errorOrPaymentActivationResponse = await activatePaymentToPagoPa(
      aConfig as PagoPaConfig,
      attivaRPTPagoPaClient
    )(req);

    expect(errorOrPaymentActivationResponse.kind).toBe("IResponseSuccessJson");
    if (errorOrPaymentActivationResponse.kind === "IResponseSuccessJson") {
      expect(errorOrPaymentActivationResponse.value).toHaveProperty(
        "importoSingoloVersamento",
        99.05
      );
      expect(errorOrPaymentActivationResponse.value).toHaveProperty(
        "ibanAccredito",
        "IT17X0605502100000001234567"
      );
      expect(errorOrPaymentActivationResponse.value).toHaveProperty(
        "causaleVersamento",
        "CAUSALE01"
      );
      expect(errorOrPaymentActivationResponse.value).toMatchObject({
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
    }
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

    const errorOrPaymentActivationResponse = (await activatePaymentToPagoPa(
      aConfig as PagoPaConfig,
      attivaRPTPagoPaClient
    )(req)) as IResponseSuccessJson<PaymentsActivationResponse>;

    expect(errorOrPaymentActivationResponse.kind).toBe(
      "IResponseErrorValidation"
    );
  });
});
