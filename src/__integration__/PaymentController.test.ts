import { OrganizationFiscalCode } from "@pagopa/ts-commons/lib/strings";
import { isRight } from "fp-ts/lib/Either";

import "jest-xml-matcher";
import * as redis from "redis";
import { CodiceContestoPagamento } from "../../generated/api/CodiceContestoPagamento";
import { ImportoEuroCents } from "../../generated/api/ImportoEuroCents";
import { cdInfoWisp_element_ppt } from "../../generated/FespCdService/cdInfoWisp_element_ppt";
import { stText35_type_ppt } from "../../generated/PagamentiTelematiciPspNodoservice/stText35_type_ppt";
import { NodeClientEnum, PagoPAConfig } from "../Configuration";
import { getPaymentInfo, activatePayment, setActivationStatus, getActivationStatus } from "../controllers/restful/PaymentController";
import { PagamentiTelematiciPspNodoAsyncClient } from "../services/pagopa_api/PPTPortClient";
import { logger } from "../utils/Logger";
import { RptIdFromString, ApplicationCode, AuxDigit, CheckDigit, IUV13, PaymentNoticeNumber } from "../utils/pagopa";
import { FakePagamentiTelematiciPspNodoAsyncClient, createPagamentiTelematiciPspNodoClient } from "./fake/fakePagamentiTelematiciPspNodoAsyncClient";
import { FakePagamentiTelematiciPspNodoNm3PspAsyncClient, createPagamentiTelematiciPspNm3NodoClient } from "./fake/fakePagamentiTelematiciPspNodoNm3AsyncClient";
import mockReq from "./fake/request";


const TEST_CLIENT_ID = NodeClientEnum.CLIENT_CHECKOUT;
const TEST_CLIENT_PN = NodeClientEnum.CLIENT_PN;

const aConfig = {
  HOST: "http://localhost",
  PORT: 3002,
  CLIENT_TIMEOUT_MSEC: 10000,
  WS_SERVICES: {
    PAGAMENTI: {
      NODO_PER_PSP: "/api/nodo-per-psp/v1",
      NODE_FOR_PSP: "/api/node-for-psp/v1",
      NODE_FOR_IO: "/api/node-for-io/v1"
    }
  },
  // These information will identify our system when it will access to PagoPA
  IDENTIFIERS: {
    [TEST_CLIENT_ID]: {
      IDENTIFICATIVO_PSP: "TEST_01",
      IDENTIFICATIVO_INTERMEDIARIO_PSP: "00735020584",
      IDENTIFICATIVO_CANALE: "00735020584_02",
      PASSWORD: "nopassword",
    }
  },
  NM3_ENABLED: true
} as PagoPAConfig;

const aConfigInvalid = {
  HOST: "http://localhost",
  PORT: 3002,
  CLIENT_TIMEOUT_MSEC: 10000,
  // These information will identify our system when it will access to PagoPA
  IDENTIFIERS: {
    [TEST_CLIENT_ID]: {
      IDENTIFICATIVO_INTERMEDIARIO_PSP: "00735020584",
      IDENTIFICATIVO_CANALE: "00735020584_02",
      PASSWORD: "nopassword",
    }
  },
  NM3_ENABLED: true
} as PagoPAConfig;

const aRptIdString = "12345678901012123456789012399";
const aRptIdStringForInvalidNodoResponse = "12345678901012123456789012300";
const aRptIdStringForTimeoutNodoResponse = "12345678901012123456789012311";
const aRptIdStringForKoWithoutDeatilsResponse = "12345678901012123456789012322";
const aRptIdStringForKoPagamentoInCorsoResponse = "12345678901012123456789012333";
const aRptIdStringForNM3Response = "12345678901012123456789012344";
const aRptIdStringForNM3InvalidResponse = "12345678901012123456789012355";
const aRptIdStringForNM3TimeoutResponse = "12345678901012123456789012366";
const aRptIdStringForKoPagamentoInCorsoNM3Response = "12345678901012123456789012377";

const aMockedRedisClient = redis.createClient(6379, "localhost");

const aCodiceContestoPagamento = "05245c90746811e8b9bf91897339427e" as stText35_type_ppt;

const aCdInfoWispPpt = {
  identificativoDominio: "idDom",
  identificativoUnivocoVersamento: "idUniv",
  codiceContestoPagamento: aCodiceContestoPagamento,
  idPagamento: "id1234"
} as cdInfoWisp_element_ppt;

const aPaymentActivationRequest = {
  rptId: RptIdFromString.encode({
    organizationFiscalCode: "12345678901" as OrganizationFiscalCode,
    paymentNoticeNumber: {
      applicationCode: "12" as ApplicationCode,
      auxDigit: "0" as AuxDigit,
      checkDigit: "99" as CheckDigit,
      iuv13: "1234567890123" as IUV13
    } as PaymentNoticeNumber
  }),
  importoSingoloVersamento: 9905 as ImportoEuroCents,
  codiceContestoPagamento: aCodiceContestoPagamento
};

const aPaymentActivationRequestForInvalidResponse = {
  rptId: RptIdFromString.encode({
    organizationFiscalCode: "12345678901" as OrganizationFiscalCode,
    paymentNoticeNumber: {
      applicationCode: "12" as ApplicationCode,
      auxDigit: "0" as AuxDigit,
      checkDigit: "00" as CheckDigit,
      iuv13: "1234567890123" as IUV13
    } as PaymentNoticeNumber
  }),

  importoSingoloVersamento: 9905 as ImportoEuroCents,
  codiceContestoPagamento: aCodiceContestoPagamento
};

const aPaymentActivationRequestForTimeoutResponse = {
  rptId: RptIdFromString.encode({
    organizationFiscalCode: "12345678901" as OrganizationFiscalCode,
    paymentNoticeNumber: {
      applicationCode: "12" as ApplicationCode,
      auxDigit: "0" as AuxDigit,
      checkDigit: "11" as CheckDigit,
      iuv13: "1234567890123" as IUV13
    } as PaymentNoticeNumber
  }),

  importoSingoloVersamento: 9905 as ImportoEuroCents,
  codiceContestoPagamento: aCodiceContestoPagamento
};

const aPaymentActivationRequestForNM3Response = {
  rptId: RptIdFromString.encode({
    organizationFiscalCode: "12345678901" as OrganizationFiscalCode,
    paymentNoticeNumber: {
      applicationCode: "12" as ApplicationCode,
      auxDigit: "0" as AuxDigit,
      checkDigit: "44" as CheckDigit,
      iuv13: "1234567890123" as IUV13
    } as PaymentNoticeNumber
  }),

  importoSingoloVersamento: 9905 as ImportoEuroCents,
  codiceContestoPagamento: aCodiceContestoPagamento
};

const aPaymentActivationRequestForInvalidNM3Response = {
  rptId: RptIdFromString.encode({
    organizationFiscalCode: "12345678901" as OrganizationFiscalCode,
    paymentNoticeNumber: {
      applicationCode: "12" as ApplicationCode,
      auxDigit: "0" as AuxDigit,
      checkDigit: "55" as CheckDigit,
      iuv13: "1234567890123" as IUV13
    } as PaymentNoticeNumber
  }),

  importoSingoloVersamento: 9905 as ImportoEuroCents,
  codiceContestoPagamento: aCodiceContestoPagamento
};

const aPaymentActivationRequestForNM3TimeoutResponse = {
  rptId: RptIdFromString.encode({
    organizationFiscalCode: "12345678901" as OrganizationFiscalCode,
    paymentNoticeNumber: {
      applicationCode: "12" as ApplicationCode,
      auxDigit: "0" as AuxDigit,
      checkDigit: "66" as CheckDigit,
      iuv13: "1234567890123" as IUV13
    } as PaymentNoticeNumber
  }),

  importoSingoloVersamento: 9905 as ImportoEuroCents,
  codiceContestoPagamento: aCodiceContestoPagamento
};

const aPaymentActivationRequestForNM3PagamentoInCorsoResponse = {
  rptId: RptIdFromString.encode({
    organizationFiscalCode: "12345678901" as OrganizationFiscalCode,
    paymentNoticeNumber: {
      applicationCode: "12" as ApplicationCode,
      auxDigit: "0" as AuxDigit,
      checkDigit: "77" as CheckDigit,
      iuv13: "1234567890123" as IUV13
    } as PaymentNoticeNumber
  }),

  importoSingoloVersamento: 9905 as ImportoEuroCents,
  codiceContestoPagamento: aCodiceContestoPagamento
};

const aPaymentActivationRequestForKoWithoutDetailsResponse = {
  rptId: RptIdFromString.encode({
    organizationFiscalCode: "12345678901" as OrganizationFiscalCode,
    paymentNoticeNumber: {
      applicationCode: "12" as ApplicationCode,
      auxDigit: "0" as AuxDigit,
      checkDigit: "22" as CheckDigit,
      iuv13: "1234567890123" as IUV13
    } as PaymentNoticeNumber
  }),

  importoSingoloVersamento: 9905 as ImportoEuroCents,
  codiceContestoPagamento: aCodiceContestoPagamento
};

const aPaymentActivationRequestForKoPagamentoInCorsoResponse = {
  rptId: RptIdFromString.encode({
    organizationFiscalCode: "12345678901" as OrganizationFiscalCode,
    paymentNoticeNumber: {
      applicationCode: "12" as ApplicationCode,
      auxDigit: "0" as AuxDigit,
      checkDigit: "33" as CheckDigit,
      iuv13: "1234567890123" as IUV13
    } as PaymentNoticeNumber
  }),

  importoSingoloVersamento: 9905 as ImportoEuroCents,
  codiceContestoPagamento: aCodiceContestoPagamento
};
describe("checkPaymentToPagoPa", () => {
  it("should return the right response", async () => {
    const verificaRPTPagoPaClient = new FakePagamentiTelematiciPspNodoAsyncClient(
      await createPagamentiTelematiciPspNodoClient({
        envelopeKey: "env"
      }),
      aConfig.CLIENT_TIMEOUT_MSEC
    );

    const verifyPaymentNoticePaClientNm3 = new FakePagamentiTelematiciPspNodoNm3PspAsyncClient(
      await createPagamentiTelematiciPspNm3NodoClient({
        envelopeKey: "env"
      }),
      aConfig.CLIENT_TIMEOUT_MSEC
    );

    const req = mockReq();
    req.params = { rpt_id_from_string: aRptIdString };
    req.headers = { "X-Client-Id": TEST_CLIENT_ID };

    const errorOrPaymentCheckResponse = await getPaymentInfo(
      aConfig,
      verificaRPTPagoPaClient,
      verifyPaymentNoticePaClientNm3
    )(req);

    expect(errorOrPaymentCheckResponse.kind).toBe("IResponseSuccessJson");
    if (errorOrPaymentCheckResponse.kind === "IResponseSuccessJson") {
      expect(errorOrPaymentCheckResponse.value).toHaveProperty(
        "importoSingoloVersamento",
        9905
      );
      expect(errorOrPaymentCheckResponse.value).toHaveProperty(
        "ibanAccredito",
        "IT17X0605502100000001234567"
      );
      expect(errorOrPaymentCheckResponse.value).toHaveProperty(
        "causaleVersamento",
        "CAUSALE01"
      );
      expect(errorOrPaymentCheckResponse.value.enteBeneficiario).toMatchObject({
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
    const aRptId = "12345654321";

    const verificaRPTPagoPaClient = new FakePagamentiTelematiciPspNodoAsyncClient(
      await createPagamentiTelematiciPspNodoClient({
        envelopeKey: "env"
      }),
      aConfig.CLIENT_TIMEOUT_MSEC
    );

    const verifyPaymentNoticePaClientNm3 = new FakePagamentiTelematiciPspNodoNm3PspAsyncClient(
      await createPagamentiTelematiciPspNm3NodoClient({
        envelopeKey: "env"
      }),
      aConfig.CLIENT_TIMEOUT_MSEC
    );

    const req = mockReq();

    // tslint:disable-next-line:no-object-mutation
    req.params = aRptId;
    req.headers = { "X-Client-Id": TEST_CLIENT_ID };

    const errorOrPaymentCheckResponse = await getPaymentInfo(
      aConfig,
      verificaRPTPagoPaClient,
      verifyPaymentNoticePaClientNm3
    )(req);

    expect(errorOrPaymentCheckResponse.kind).toBe("IResponseErrorValidation");
  });

  it("should return error invalid client header", async () => {

    const verificaRPTPagoPaClient = new FakePagamentiTelematiciPspNodoAsyncClient(
      await createPagamentiTelematiciPspNodoClient({
        envelopeKey: "env"
      }),
      aConfig.CLIENT_TIMEOUT_MSEC
    );
  
    const verifyPaymentNoticePaClientNm3 = new FakePagamentiTelematiciPspNodoNm3PspAsyncClient(
      await createPagamentiTelematiciPspNm3NodoClient({
        envelopeKey: "env"
      }),
      aConfig.CLIENT_TIMEOUT_MSEC
    );
  
    const req = mockReq();
  
    // tslint:disable-next-line:no-object-mutation
    req.params = aRptIdString;
    req.headers = { "X-Client-Id": "invalid_client" };
  
    const errorOrPaymentCheckResponse = await getPaymentInfo(
      aConfig,
      verificaRPTPagoPaClient,
      verifyPaymentNoticePaClientNm3
    )(req);
  
    expect(errorOrPaymentCheckResponse.kind).toBe("IResponseErrorValidation");
  });

  it("should return generic error due to invalid nodo response", async () => {

    const verificaRPTPagoPaClient = new FakePagamentiTelematiciPspNodoAsyncClient(
      await createPagamentiTelematiciPspNodoClient({
        envelopeKey: "env"
      }),
      aConfig.CLIENT_TIMEOUT_MSEC
    );
  
    const verifyPaymentNoticePaClientNm3 = new FakePagamentiTelematiciPspNodoNm3PspAsyncClient(
      await createPagamentiTelematiciPspNm3NodoClient({
        envelopeKey: "env"
      }),
      aConfig.CLIENT_TIMEOUT_MSEC
    );
  
    const req = mockReq();
  
    // tslint:disable-next-line:no-object-mutation
    req.params = { rpt_id_from_string: aRptIdStringForInvalidNodoResponse };;
    req.headers = { "X-Client-Id": TEST_CLIENT_ID };
  
    const errorOrPaymentCheckResponse = await getPaymentInfo(
      aConfig,
      verificaRPTPagoPaClient,
      verifyPaymentNoticePaClientNm3
    )(req);
    expect(errorOrPaymentCheckResponse.kind).toBe("IResponseErrorInternal");
  });

  it("should return timeout error due to nodo timeout", async () => {

    const verificaRPTPagoPaClient = new FakePagamentiTelematiciPspNodoAsyncClient(
      await createPagamentiTelematiciPspNodoClient({
        envelopeKey: "env"
      }),
      aConfig.CLIENT_TIMEOUT_MSEC
    );
  
    const verifyPaymentNoticePaClientNm3 = new FakePagamentiTelematiciPspNodoNm3PspAsyncClient(
      await createPagamentiTelematiciPspNm3NodoClient({
        envelopeKey: "env"
      }),
      aConfig.CLIENT_TIMEOUT_MSEC
    );
  
    const req = mockReq();
  
    // tslint:disable-next-line:no-object-mutation
    req.params = { rpt_id_from_string: aRptIdStringForTimeoutNodoResponse };;
    req.headers = { "X-Client-Id": TEST_CLIENT_ID };
  
    const errorOrPaymentCheckResponse = await getPaymentInfo(
      aConfig,
      verificaRPTPagoPaClient,
      verifyPaymentNoticePaClientNm3
    )(req);
    expect(errorOrPaymentCheckResponse.kind).toBe("IResponseErrorGatewayTimeout");
  });

  it("should return generic error due to nodo KO without details", async () => {

    const verificaRPTPagoPaClient = new FakePagamentiTelematiciPspNodoAsyncClient(
      await createPagamentiTelematiciPspNodoClient({
        envelopeKey: "env"
      }),
      aConfig.CLIENT_TIMEOUT_MSEC
    );
  
    const verifyPaymentNoticePaClientNm3 = new FakePagamentiTelematiciPspNodoNm3PspAsyncClient(
      await createPagamentiTelematiciPspNm3NodoClient({
        envelopeKey: "env"
      }),
      aConfig.CLIENT_TIMEOUT_MSEC
    );
  
    const req = mockReq();
  
    // tslint:disable-next-line:no-object-mutation
    req.params = { rpt_id_from_string: aRptIdStringForKoWithoutDeatilsResponse };;
    req.headers = { "X-Client-Id": TEST_CLIENT_ID };
  
    const errorOrPaymentCheckResponse = await getPaymentInfo(
      aConfig,
      verificaRPTPagoPaClient,
      verifyPaymentNoticePaClientNm3
    )(req);
    expect(errorOrPaymentCheckResponse.kind).toBe("IResponseErrorInternal");
  });

  it("should return detail error due to nodo PAA_PAGAMENTO_IN_CORSO", async () => {

    const verificaRPTPagoPaClient = new FakePagamentiTelematiciPspNodoAsyncClient(
      await createPagamentiTelematiciPspNodoClient({
        envelopeKey: "env"
      }),
      aConfig.CLIENT_TIMEOUT_MSEC
    );
  
    const verifyPaymentNoticePaClientNm3 = new FakePagamentiTelematiciPspNodoNm3PspAsyncClient(
      await createPagamentiTelematiciPspNm3NodoClient({
        envelopeKey: "env"
      }),
      aConfig.CLIENT_TIMEOUT_MSEC
    );
  
    const req = mockReq();
  
    // tslint:disable-next-line:no-object-mutation
    req.params = { rpt_id_from_string: aRptIdStringForKoPagamentoInCorsoResponse };;
    req.headers = { "X-Client-Id": TEST_CLIENT_ID };
  
    const errorOrPaymentCheckResponse = await getPaymentInfo(
      aConfig,
      verificaRPTPagoPaClient,
      verifyPaymentNoticePaClientNm3
    )(req);
    expect(errorOrPaymentCheckResponse.kind).toBe("IResponseErrorInternal");
  });

  it("should return right response for PPT_MULTI_BENEFICIARIO", async () => {

    const verificaRPTPagoPaClient = new FakePagamentiTelematiciPspNodoAsyncClient(
      await createPagamentiTelematiciPspNodoClient({
        envelopeKey: "env"
      }),
      aConfig.CLIENT_TIMEOUT_MSEC
    );
  
    const verifyPaymentNoticePaClientNm3 = new FakePagamentiTelematiciPspNodoNm3PspAsyncClient(
      await createPagamentiTelematiciPspNm3NodoClient({
        envelopeKey: "env"
      }),
      aConfig.CLIENT_TIMEOUT_MSEC
    );
  
    const req = mockReq();
  
    // tslint:disable-next-line:no-object-mutation
    req.params = { rpt_id_from_string: aRptIdStringForNM3Response };;
    req.headers = { "X-Client-Id": TEST_CLIENT_ID };
  
    const errorOrPaymentCheckResponse = await getPaymentInfo(
      aConfig,
      verificaRPTPagoPaClient,
      verifyPaymentNoticePaClientNm3
    )(req);
    expect(errorOrPaymentCheckResponse.kind).toBe("IResponseSuccessJson");
  });

  it("should return invalid response for PPT_MULTI_BENEFICIARIO", async () => {

    const verificaRPTPagoPaClient = new FakePagamentiTelematiciPspNodoAsyncClient(
      await createPagamentiTelematiciPspNodoClient({
        envelopeKey: "env"
      }),
      aConfig.CLIENT_TIMEOUT_MSEC
    );
  
    const verifyPaymentNoticePaClientNm3 = new FakePagamentiTelematiciPspNodoNm3PspAsyncClient(
      await createPagamentiTelematiciPspNm3NodoClient({
        envelopeKey: "env"
      }),
      aConfig.CLIENT_TIMEOUT_MSEC
    );
  
    const req = mockReq();
  
    // tslint:disable-next-line:no-object-mutation
    req.params = { rpt_id_from_string: aRptIdStringForNM3InvalidResponse };;
    req.headers = { "X-Client-Id": TEST_CLIENT_ID };
  
    const errorOrPaymentCheckResponse = await getPaymentInfo(
      aConfig,
      verificaRPTPagoPaClient,
      verifyPaymentNoticePaClientNm3
    )(req);
    expect(errorOrPaymentCheckResponse.kind).toBe("IResponseErrorInternal");
  
  
  });
  it("should return timeout due to timeout PPT_MULTI_BENEFICIARIO", async () => {

    const verificaRPTPagoPaClient = new FakePagamentiTelematiciPspNodoAsyncClient(
      await createPagamentiTelematiciPspNodoClient({
        envelopeKey: "env"
      }),
      aConfig.CLIENT_TIMEOUT_MSEC
    );
  
    const verifyPaymentNoticePaClientNm3 = new FakePagamentiTelematiciPspNodoNm3PspAsyncClient(
      await createPagamentiTelematiciPspNm3NodoClient({
        envelopeKey: "env"
      }),
      aConfig.CLIENT_TIMEOUT_MSEC
    );
  
    const req = mockReq();
  
    // tslint:disable-next-line:no-object-mutation
    req.params = { rpt_id_from_string: aRptIdStringForNM3TimeoutResponse };;
    req.headers = { "X-Client-Id": TEST_CLIENT_ID };
  
    const errorOrPaymentCheckResponse = await getPaymentInfo(
      aConfig,
      verificaRPTPagoPaClient,
      verifyPaymentNoticePaClientNm3
    )(req);
    expect(errorOrPaymentCheckResponse.kind).toBe("IResponseErrorGatewayTimeout");
  });

  it("should return detail error due to nodo PAA_PAGAMENTO_IN_CORSO for NM3", async () => {

    const verificaRPTPagoPaClient = new FakePagamentiTelematiciPspNodoAsyncClient(
      await createPagamentiTelematiciPspNodoClient({
        envelopeKey: "env"
      }),
      aConfig.CLIENT_TIMEOUT_MSEC
    );
  
    const verifyPaymentNoticePaClientNm3 = new FakePagamentiTelematiciPspNodoNm3PspAsyncClient(
      await createPagamentiTelematiciPspNm3NodoClient({
        envelopeKey: "env"
      }),
      aConfig.CLIENT_TIMEOUT_MSEC
    );
  
    const req = mockReq();
  
    // tslint:disable-next-line:no-object-mutation
    req.params = { rpt_id_from_string: aRptIdStringForKoPagamentoInCorsoNM3Response };;
    req.headers = { "X-Client-Id": TEST_CLIENT_ID };
  
    const errorOrPaymentCheckResponse = await getPaymentInfo(
      aConfig,
      verificaRPTPagoPaClient,
      verifyPaymentNoticePaClientNm3
    )(req);
    expect(errorOrPaymentCheckResponse.kind).toBe("IResponseErrorInternal");
  });

  it("should return error with invalid nodo configuration", async () => {

    const verificaRPTPagoPaClient = new FakePagamentiTelematiciPspNodoAsyncClient(
      await createPagamentiTelematiciPspNodoClient({
        envelopeKey: "env"
      }),
      aConfig.CLIENT_TIMEOUT_MSEC
    );
  
    const verifyPaymentNoticePaClientNm3 = new FakePagamentiTelematiciPspNodoNm3PspAsyncClient(
      await createPagamentiTelematiciPspNm3NodoClient({
        envelopeKey: "env"
      }),
      aConfig.CLIENT_TIMEOUT_MSEC
    );
  
    const req = mockReq();
  
    // tslint:disable-next-line:no-object-mutation
    req.params = { rpt_id_from_string: aRptIdStringForNM3Response };;
    req.headers = { "X-Client-Id": TEST_CLIENT_ID };
  
    const errorOrPaymentCheckResponse = await getPaymentInfo(
      aConfigInvalid,
      verificaRPTPagoPaClient,
      verifyPaymentNoticePaClientNm3
    )(req);
    expect(errorOrPaymentCheckResponse.kind).toBe("IResponseErrorValidation");
  });
});

describe("activatePaymentToPagoPa", () => {
  it("should correctly format amounts", async () => {
    const clientRequest = jest.fn((_, __, cb) => cb());
    const client = await createPagamentiTelematiciPspNodoClient({
      // tslint:disable-next-line: no-any
      request: clientRequest as any
    });

    const attivaRPTPagoPaClient = new PagamentiTelematiciPspNodoAsyncClient(
      client, aConfig.CLIENT_TIMEOUT_MSEC
    );

    const activeIoPaymentClientNm3 = new FakePagamentiTelematiciPspNodoNm3PspAsyncClient(
      await createPagamentiTelematiciPspNm3NodoClient({
        envelopeKey: "env"
      }),
      aConfig.CLIENT_TIMEOUT_MSEC
    );

    const activateRequest = mockReq();
    activateRequest.headers = { "X-Client-Id": TEST_CLIENT_ID };

    activateRequest.body = {
      ...aPaymentActivationRequest,
      importoSingoloVersamento: 9900 as ImportoEuroCents
    };

    await activatePayment(
      aConfig,
      attivaRPTPagoPaClient,
      activeIoPaymentClientNm3,
      aMockedRedisClient,
      0
    )(activateRequest);

    expect(clientRequest).toHaveBeenCalledTimes(1);
    expect(clientRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        body:
          '<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"  xmlns:ppt="http://ws.pagamenti.telematici.gov/" xmlns:tns="http://PuntoAccessoPSP.spcoop.gov.it/servizi/PagamentiTelematiciPspNodo" xmlns:pay_i="http://www.digitpa.gov.it/schemas/2011/Pagamenti/" xmlns:qrc="http://PuntoAccessoPSP.spcoop.gov.it/QrCode"><soap:Body><ppt:nodoAttivaRPT xmlns:ppt="http://ws.pagamenti.telematici.gov/"><identificativoPSP>TEST_01</identificativoPSP><identificativoIntermediarioPSP>00735020584</identificativoIntermediarioPSP><identificativoCanale>00735020584_02</identificativoCanale><password>nopassword</password><codiceContestoPagamento>05245c90746811e8b9bf91897339427e</codiceContestoPagamento><identificativoIntermediarioPSPPagamento>00735020584</identificativoIntermediarioPSPPagamento><codificaInfrastrutturaPSP>QR-CODE</codificaInfrastrutturaPSP><codiceIdRPT><qrc:QrCode><qrc:CF>12345678901</qrc:CF><qrc:CodStazPA>12</qrc:CodStazPA><qrc:AuxDigit>0</qrc:AuxDigit><qrc:CodIUV>123456789012399</qrc:CodIUV></qrc:QrCode></codiceIdRPT><datiPagamentoPSP><importoSingoloVersamento>99.00</importoSingoloVersamento></datiPagamentoPSP></ppt:nodoAttivaRPT></soap:Body></soap:Envelope>'
      }),
      expect.anything()
    );
  });

  it("should return the right response", async () => {
    const attivaRPTPagoPaClient = new FakePagamentiTelematiciPspNodoAsyncClient(
      await createPagamentiTelematiciPspNodoClient({
        envelopeKey: "env"
      }),
      aConfig.CLIENT_TIMEOUT_MSEC
    );

    const activeIoPaymentClientNm3 = new FakePagamentiTelematiciPspNodoNm3PspAsyncClient(
      await createPagamentiTelematiciPspNm3NodoClient({
        envelopeKey: "env"
      }),
      aConfig.CLIENT_TIMEOUT_MSEC
    );

    const req = mockReq();
    req.body = aPaymentActivationRequest;
    req.headers = { "X-Client-Id": TEST_CLIENT_ID };

    const errorOrPaymentActivationResponse = await activatePayment(
      aConfig,
      attivaRPTPagoPaClient,
      activeIoPaymentClientNm3,
      aMockedRedisClient,
      0
    )(req);

    expect(errorOrPaymentActivationResponse.kind).toBe("IResponseSuccessJson");
    if (errorOrPaymentActivationResponse.kind === "IResponseSuccessJson") {
      expect(errorOrPaymentActivationResponse.value).toHaveProperty(
        "importoSingoloVersamento",
        9905
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
    const attivaRPTPagoPaClient = new FakePagamentiTelematiciPspNodoAsyncClient(
      await createPagamentiTelematiciPspNodoClient({
        envelopeKey: "env"
      }),
      aConfig.CLIENT_TIMEOUT_MSEC
    );
    const verifyPaymentNoticePaClientNm3 = new FakePagamentiTelematiciPspNodoNm3PspAsyncClient(
      await createPagamentiTelematiciPspNm3NodoClient({
        envelopeKey: "env"
      }),
      aConfig.CLIENT_TIMEOUT_MSEC
    );

    const req = mockReq();

    // tslint:disable-next-line:no-object-mutation
    req.params = aPaymentActivationRequest;

    const errorOrPaymentActivationResponse = await activatePayment(
      aConfig,
      attivaRPTPagoPaClient,
      verifyPaymentNoticePaClientNm3,
      aMockedRedisClient,
      0
    )(req);

    expect(errorOrPaymentActivationResponse.kind).toBe(
      "IResponseErrorValidation"
    );
  });

  it("should return error invalid client header", async () => {
   
    const attivaRPTPagoPaClient = new FakePagamentiTelematiciPspNodoAsyncClient(
      await createPagamentiTelematiciPspNodoClient({
        envelopeKey: "env"
      }),
      aConfig.CLIENT_TIMEOUT_MSEC
    );
    const verifyPaymentNoticePaClientNm3 = new FakePagamentiTelematiciPspNodoNm3PspAsyncClient(
      await createPagamentiTelematiciPspNm3NodoClient({
        envelopeKey: "env"
      }),
      aConfig.CLIENT_TIMEOUT_MSEC
    );

    const req = mockReq();

    req.headers = { "X-Client-Id": "Invalid_Client" };

    // tslint:disable-next-line:no-object-mutation
    req.params = aPaymentActivationRequest;

    const errorOrPaymentActivationResponse = await activatePayment(
      aConfig,
      attivaRPTPagoPaClient,
      verifyPaymentNoticePaClientNm3,
      aMockedRedisClient,
      0
    )(req);

    expect(errorOrPaymentActivationResponse.kind).toBe(
      "IResponseErrorValidation"
    );
  });

  it("Should correctly receive response with PN as client", async () => {
    const attivaRPTPagoPaClient = new FakePagamentiTelematiciPspNodoAsyncClient(
      await createPagamentiTelematiciPspNodoClient({
        envelopeKey: "env"
      }),
      aConfig.CLIENT_TIMEOUT_MSEC
    );

    const activeIoPaymentClientNm3 = new FakePagamentiTelematiciPspNodoNm3PspAsyncClient(
      await createPagamentiTelematiciPspNm3NodoClient({
        envelopeKey: "env"
      }),
      aConfig.CLIENT_TIMEOUT_MSEC
    );

    const req = mockReq();
    req.body = aPaymentActivationRequest;
    req.headers = { "X-Client-Id": TEST_CLIENT_PN };

    const errorOrPaymentActivationResponse = await activatePayment(
      aConfig,
      attivaRPTPagoPaClient,
      activeIoPaymentClientNm3,
      aMockedRedisClient,
      0
    )(req);

    expect(errorOrPaymentActivationResponse.kind).toBe("IResponseSuccessJson");
    if (errorOrPaymentActivationResponse.kind === "IResponseSuccessJson") {
      expect(errorOrPaymentActivationResponse.value).toHaveProperty(
        "importoSingoloVersamento",
        9905
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

  it("should return generic error due to invalid nodo response", async () => {

    const attivaRPTPagoPaClient = new FakePagamentiTelematiciPspNodoAsyncClient(
      await createPagamentiTelematiciPspNodoClient({
        envelopeKey: "env"
      }),
      aConfig.CLIENT_TIMEOUT_MSEC
    );

    const activeIoPaymentClientNm3 = new FakePagamentiTelematiciPspNodoNm3PspAsyncClient(
      await createPagamentiTelematiciPspNm3NodoClient({
        envelopeKey: "env"
      }),
      aConfig.CLIENT_TIMEOUT_MSEC
    );

    const req = mockReq();
    req.body = aPaymentActivationRequestForInvalidResponse;
    req.headers = { "X-Client-Id": TEST_CLIENT_ID };

    const errorOrPaymentActivationResponse = await activatePayment(
      aConfig,
      attivaRPTPagoPaClient,
      activeIoPaymentClientNm3,
      aMockedRedisClient,
      0
    )(req);
  
    expect(errorOrPaymentActivationResponse.kind).toBe("IResponseErrorInternal");
  });

  it("should return timeout error due to nodo timeout", async () => {

    const attivaRPTPagoPaClient = new FakePagamentiTelematiciPspNodoAsyncClient(
      await createPagamentiTelematiciPspNodoClient({
        envelopeKey: "env"
      }),
      aConfig.CLIENT_TIMEOUT_MSEC
    );

    const activeIoPaymentClientNm3 = new FakePagamentiTelematiciPspNodoNm3PspAsyncClient(
      await createPagamentiTelematiciPspNm3NodoClient({
        envelopeKey: "env"
      }),
      aConfig.CLIENT_TIMEOUT_MSEC
    );

    const req = mockReq();
    req.body = aPaymentActivationRequestForTimeoutResponse;
    req.headers = { "X-Client-Id": TEST_CLIENT_ID };

    const errorOrPaymentActivationResponse = await activatePayment(
      aConfig,
      attivaRPTPagoPaClient,
      activeIoPaymentClientNm3,
      aMockedRedisClient,
      0
    )(req);
  
    expect(errorOrPaymentActivationResponse.kind).toBe("IResponseErrorGatewayTimeout");
  });

  it("should return generic error due to nodo KO without details", async () => {

    const attivaRPTPagoPaClient = new FakePagamentiTelematiciPspNodoAsyncClient(
      await createPagamentiTelematiciPspNodoClient({
        envelopeKey: "env"
      }),
      aConfig.CLIENT_TIMEOUT_MSEC
    );

    const activeIoPaymentClientNm3 = new FakePagamentiTelematiciPspNodoNm3PspAsyncClient(
      await createPagamentiTelematiciPspNm3NodoClient({
        envelopeKey: "env"
      }),
      aConfig.CLIENT_TIMEOUT_MSEC
    );

    const req = mockReq();
    req.body = aPaymentActivationRequestForKoWithoutDetailsResponse;
    req.headers = { "X-Client-Id": TEST_CLIENT_ID };

    const errorOrPaymentActivationResponse = await activatePayment(
      aConfig,
      attivaRPTPagoPaClient,
      activeIoPaymentClientNm3,
      aMockedRedisClient,
      0
    )(req);
  
    expect(errorOrPaymentActivationResponse.kind).toBe("IResponseErrorInternal");
  });

  it("should return detail error due to nodo PAA_PAGAMENTO_IN_CORSO", async () => {

    const attivaRPTPagoPaClient = new FakePagamentiTelematiciPspNodoAsyncClient(
      await createPagamentiTelematiciPspNodoClient({
        envelopeKey: "env"
      }),
      aConfig.CLIENT_TIMEOUT_MSEC
    );

    const activeIoPaymentClientNm3 = new FakePagamentiTelematiciPspNodoNm3PspAsyncClient(
      await createPagamentiTelematiciPspNm3NodoClient({
        envelopeKey: "env"
      }),
      aConfig.CLIENT_TIMEOUT_MSEC
    );

    const req = mockReq();
    req.body = aPaymentActivationRequestForKoPagamentoInCorsoResponse;
    req.headers = { "X-Client-Id": TEST_CLIENT_ID };

    const errorOrPaymentActivationResponse = await activatePayment(
      aConfig,
      attivaRPTPagoPaClient,
      activeIoPaymentClientNm3,
      aMockedRedisClient,
      0
    )(req);
  
    expect(errorOrPaymentActivationResponse.kind).toBe("IResponseErrorInternal");
  });

  it("should return right response for PPT_MULTI_BENEFICIARIO", async () => {

    const attivaRPTPagoPaClient = new FakePagamentiTelematiciPspNodoAsyncClient(
      await createPagamentiTelematiciPspNodoClient({
        envelopeKey: "env"
      }),
      aConfig.CLIENT_TIMEOUT_MSEC
    );

    const activeIoPaymentClientNm3 = new FakePagamentiTelematiciPspNodoNm3PspAsyncClient(
      await createPagamentiTelematiciPspNm3NodoClient({
        envelopeKey: "env"
      }),
      aConfig.CLIENT_TIMEOUT_MSEC
    );

    const req = mockReq();
    req.body = aPaymentActivationRequestForNM3Response;
    req.headers = { "X-Client-Id": TEST_CLIENT_ID };

    aMockedRedisClient.on("connect", () => {
      return logger.info("Mocked Redis connected!");
    });


    const errorOrPaymentActivationResponse = await activatePayment(
      aConfig,
      attivaRPTPagoPaClient,
      activeIoPaymentClientNm3,
      aMockedRedisClient,
      10000
    )(req);
  
    expect(aMockedRedisClient.connected).toBeTruthy();

    expect(errorOrPaymentActivationResponse.kind).toBe("IResponseSuccessJson");

  });
  
  it("should return error response with invalid configuration", async () => {

    const attivaRPTPagoPaClient = new FakePagamentiTelematiciPspNodoAsyncClient(
      await createPagamentiTelematiciPspNodoClient({
        envelopeKey: "env"
      }),
      aConfig.CLIENT_TIMEOUT_MSEC
    );

    const activeIoPaymentClientNm3 = new FakePagamentiTelematiciPspNodoNm3PspAsyncClient(
      await createPagamentiTelematiciPspNm3NodoClient({
        envelopeKey: "env"
      }),
      aConfig.CLIENT_TIMEOUT_MSEC
    );

    const req = mockReq();
    req.body = aPaymentActivationRequestForNM3Response;
    req.headers = { "X-Client-Id": TEST_CLIENT_ID };

    aMockedRedisClient.on("connect", () => {
      return logger.info("Mocked Redis connected!");
    });


    const errorOrPaymentActivationResponse = await activatePayment(
      aConfigInvalid,
      attivaRPTPagoPaClient,
      activeIoPaymentClientNm3,
      aMockedRedisClient,
      10000
    )(req);
  
    expect(aMockedRedisClient.connected).toBeTruthy();

    expect(errorOrPaymentActivationResponse.kind).toBe("IResponseErrorValidation");

  });

  it("should return timeout due to timeout PPT_MULTI_BENEFICIARIO", async () => {

    const attivaRPTPagoPaClient = new FakePagamentiTelematiciPspNodoAsyncClient(
      await createPagamentiTelematiciPspNodoClient({
        envelopeKey: "env"
      }),
      aConfig.CLIENT_TIMEOUT_MSEC
    );

    const activeIoPaymentClientNm3 = new FakePagamentiTelematiciPspNodoNm3PspAsyncClient(
      await createPagamentiTelematiciPspNm3NodoClient({
        envelopeKey: "env"
      }),
      aConfig.CLIENT_TIMEOUT_MSEC
    );

    const req = mockReq();
    req.body = aPaymentActivationRequestForNM3TimeoutResponse;
    req.headers = { "X-Client-Id": TEST_CLIENT_ID };

    const errorOrPaymentActivationResponse = await activatePayment(
      aConfig,
      attivaRPTPagoPaClient,
      activeIoPaymentClientNm3,
      aMockedRedisClient,
      10000
    )(req);
  
    expect(errorOrPaymentActivationResponse.kind).toBe("IResponseErrorGatewayTimeout");
  });

  it("should return detail for activate due to nodo PAA_PAGAMENTO_IN_CORSO for NM3", async () => {

    const attivaRPTPagoPaClient = new FakePagamentiTelematiciPspNodoAsyncClient(
      await createPagamentiTelematiciPspNodoClient({
        envelopeKey: "env"
      }),
      aConfig.CLIENT_TIMEOUT_MSEC
    );

    const activeIoPaymentClientNm3 = new FakePagamentiTelematiciPspNodoNm3PspAsyncClient(
      await createPagamentiTelematiciPspNm3NodoClient({
        envelopeKey: "env"
      }),
      aConfig.CLIENT_TIMEOUT_MSEC
    );

    const req = mockReq();
    req.body = aPaymentActivationRequestForNM3PagamentoInCorsoResponse;
    req.headers = { "X-Client-Id": TEST_CLIENT_ID };

    const errorOrPaymentActivationResponse = await activatePayment(
      aConfig,
      attivaRPTPagoPaClient,
      activeIoPaymentClientNm3,
      aMockedRedisClient,
      10000
    )(req);
  
    expect(errorOrPaymentActivationResponse.kind).toBe("IResponseErrorInternal");
  });

  it("should return invalid response for PPT_MULTI_BENEFICIARIO", async () => {

    const attivaRPTPagoPaClient = new FakePagamentiTelematiciPspNodoAsyncClient(
      await createPagamentiTelematiciPspNodoClient({
        envelopeKey: "env"
      }),
      aConfig.CLIENT_TIMEOUT_MSEC
    );

    const activeIoPaymentClientNm3 = new FakePagamentiTelematiciPspNodoNm3PspAsyncClient(
      await createPagamentiTelematiciPspNm3NodoClient({
        envelopeKey: "env"
      }),
      aConfig.CLIENT_TIMEOUT_MSEC
    );

    const req = mockReq();
    req.body = aPaymentActivationRequestForInvalidNM3Response;
    req.headers = { "X-Client-Id": TEST_CLIENT_ID };

    const errorOrPaymentActivationResponse = await activatePayment(
      aConfig,
      attivaRPTPagoPaClient,
      activeIoPaymentClientNm3,
      aMockedRedisClient,
      10000
    )(req);
  
    expect(errorOrPaymentActivationResponse.kind).toBe("IResponseErrorInternal");
  });
});

describe("setActivationStatus and getActivationStatus", () => {
  it("should store payment id and payment info in redis db", async () => {
    const req = mockReq();

    // tslint:disable-next-line:no-object-mutation
    req.params = aPaymentActivationRequest;
    req.headers = { "X-Client-Id": TEST_CLIENT_ID };

    await setActivationStatus(aCdInfoWispPpt, 5000, aMockedRedisClient);

    aMockedRedisClient.on("connect", () => {
      return logger.info("Mocked Redis connected!");
    });

    const errorOrPaymentActivationGet = await getActivationStatus(
      aMockedRedisClient
    )(req);

    expect(aMockedRedisClient.connected).toBeTruthy();
    const keyCodiceContestoPagamento = aMockedRedisClient.get(
      aCodiceContestoPagamento,
      (error, result) => {
        if (error) {
          throw error;
        }
        expect(result).toBe("id1234");
      }
    );

    expect(keyCodiceContestoPagamento).toBeTruthy();
    expect(errorOrPaymentActivationGet.kind).toBe("IResponseSuccessJson");
    if (errorOrPaymentActivationGet.kind === "IResponseSuccessJson") {
      expect(errorOrPaymentActivationGet.value.idPagamento).toBe("id1234");
    }
    aMockedRedisClient.quit();
  });

  it("should fail store payment without redis connection", async () => {
    const req = mockReq();

    // tslint:disable-next-line:no-object-mutation
    req.params = aPaymentActivationRequest;
    req.headers = { "X-Client-Id": TEST_CLIENT_ID };

    await setActivationStatus(aCdInfoWispPpt, 5000, aMockedRedisClient);

    const errorOrPaymentActivationGet = await getActivationStatus(
      aMockedRedisClient
    )(req);

    expect(errorOrPaymentActivationGet.kind).toBe("IResponseErrorInternal");
    
  });
});
