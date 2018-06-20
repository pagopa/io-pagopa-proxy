import { clients } from "italia-pagopa-api";
import { PPTPortTypes } from "italia-pagopa-api/dist/wsdl-lib/PagamentiTelematiciPspNodoservice/PPTPort";
import "jest-xml-matcher";
import { PagoPaConfig } from "../Configuration";
import { checkPaymentToPagoPa } from "../controllers/restful/PaymentController";
import { FiscalCode, IUV } from "../types/CommonTypes";
import { PaymentsCheckRequest } from "../types/controllers/PaymentsCheckRequest";
import {
  createPagamentiTelematiciPspNodoClient,
  FakePagamentiTelematiciPspNodoAsyncClient
} from "./fake/fakePagamentiTelematiciPspNodoAsyncClient";
import mockReq from "./fake/request";

const avvisaturaHost = "avvisatura.test";
const avvisaturaEndpoint = `http://${avvisaturaHost}/avvisatura/`;
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

describe("checkPaymentToPagoPa", async () => {
  it("should return the right response", async () => {
    const pagamentiTelematiciPspNodoClientBase = await clients.createPagamentiTelematiciPspNodoClient(
      {
        endpoint: avvisaturaEndpoint,
        envelopeKey: "soapenv"
      }
    );
    pagamentiTelematiciPspNodoClientBase.addHttpHeader("Host", avvisaturaHost);

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

    const y = await checkPaymentToPagoPa(
      aConfig as PagoPaConfig,
      verificaRPTPagoPaClient
    )(req);
    expect(y.kind).toBe("IResponseSuccessJson");
  });
});
