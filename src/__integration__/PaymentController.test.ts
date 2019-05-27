import * as express from "express";
import { isRight } from "fp-ts/lib/Either";
import {
  ApplicationCode,
  AuxDigit,
  CheckDigit,
  IUV13,
  PaymentNoticeNumber,
  RptIdFromString
} from "italia-ts-commons/lib/pagopa";
import { OrganizationFiscalCode } from "italia-ts-commons/lib/strings";
import "jest-xml-matcher";
import * as redis from "redis";
import { PagoPAConfig } from "../Configuration";
import {
  activatePayment,
  getActivationStatus,
  getPaymentInfo,
  setActivationStatus
} from "../controllers/restful/PaymentController";
import { CodiceContestoPagamento } from "../types/api/CodiceContestoPagamento";
import { ImportoEuroCents } from "../types/api/ImportoEuroCents";
import { cdInfoWisp_ppt } from "../types/pagopa_api/yaml-to-ts/cdInfoWisp_ppt";
import { stText35_ppt } from "../types/pagopa_api/yaml-to-ts/stText35_ppt";
import { logger } from "../utils/Logger";
import {
  createPagamentiTelematiciPspNodoClient,
  FakePagamentiTelematiciPspNodoAsyncClient
} from "./fake/fakePagamentiTelematiciPspNodoAsyncClient";
import mockReq from "./fake/request";

const aConfig = {
  HOST: "http://localhost",
  PORT: 3002,
  WS_SERVICES: {
    PAGAMENTI: "/PagamentiTelematiciPspNodoservice/"
  },
  // These information will identify our system when it will access to PagoPA
  IDENTIFIER: {
    IDENTIFICATIVO_PSP: "AGID_01",
    IDENTIFICATIVO_INTERMEDIARIO_PSP: "97735020584",
    IDENTIFICATIVO_CANALE: "97735020584_02",
    PASSWORD: "nopassword"
  }
} as PagoPAConfig;
const aRptIdString = "12345678901012123456789012399";

const aMockedRedisClient = redis.createClient(6379, "localhost");

const aCodiceContestoPagamento = "05245c90746811e8b9bf91897339427e" as stText35_ppt;

const aCdInfoWispPpt = {
  identificativoDominio: "idDom",
  identificativoUnivocoVersamento: "idUniv",
  codiceContestoPagamento: aCodiceContestoPagamento,
  idPagamento: "id1234"
} as cdInfoWisp_ppt;

describe("checkPaymentToPagoPa", async () => {
  it("should return the right response", async () => {
    const verificaRPTPagoPaClient = new FakePagamentiTelematiciPspNodoAsyncClient(
      await createPagamentiTelematiciPspNodoClient({
        envelopeKey: "env"
      })
    );

    const req = {
      params: { rptId: aRptIdString }
    } as express.Request;
    const errorOrPaymentCheckResponse = await getPaymentInfo(
      aConfig,
      verificaRPTPagoPaClient
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
      })
    );

    const req = mockReq();

    // tslint:disable-next-line:no-object-mutation
    req.params = aRptId;

    const errorOrPaymentCheckResponse = await getPaymentInfo(
      aConfig,
      verificaRPTPagoPaClient
    )(req);

    expect(errorOrPaymentCheckResponse.kind).toBe("IResponseErrorValidation");
  });
});

describe("activatePaymentToPagoPa", async () => {
  it("should return the right response", async () => {
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

    const attivaRPTPagoPaClient = new FakePagamentiTelematiciPspNodoAsyncClient(
      await createPagamentiTelematiciPspNodoClient({
        envelopeKey: "env"
      })
    );

    const req = mockReq();

    // tslint:disable-next-line:no-object-mutation
    req.body = aPaymentActivationRequest;

    const errorOrPaymentActivationResponse = await activatePayment(
      aConfig,
      attivaRPTPagoPaClient
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
    const aPaymentActivationRequest = {
      rptId: {
        organizationFiscalCode: "XXX" as OrganizationFiscalCode,
        paymentNoticeNumber: {
          applicationCode: "99" as ApplicationCode,
          auxDigit: "0" as AuxDigit,
          checkDigit: "99" as CheckDigit,
          iuv13: "1234567890123" as IUV13
        } as PaymentNoticeNumber
      } as RptIdFromString,
      importoSingoloVersamento: 9905 as ImportoEuroCents,
      codiceContestoPagamento: aCodiceContestoPagamento
    };

    const attivaRPTPagoPaClient = new FakePagamentiTelematiciPspNodoAsyncClient(
      await createPagamentiTelematiciPspNodoClient({
        envelopeKey: "env"
      })
    );

    const req = mockReq();

    // tslint:disable-next-line:no-object-mutation
    req.params = aPaymentActivationRequest;

    const errorOrPaymentActivationResponse = await activatePayment(
      aConfig,
      attivaRPTPagoPaClient
    )(req);

    expect(errorOrPaymentActivationResponse.kind).toBe(
      "IResponseErrorValidation"
    );
  });
});

describe("setActivationStatus and getActivationStatus", () => {
  it("should store payment id and payment info in redis db", async () => {
    const aPaymentActivationRequest = {
      rptId: {
        organizationFiscalCode: "12345678901" as OrganizationFiscalCode,
        paymentNoticeNumber: {
          applicationCode: "99" as ApplicationCode,
          auxDigit: "0" as AuxDigit,
          checkDigit: "99" as CheckDigit,
          iuv13: "1234567890123" as IUV13
        } as PaymentNoticeNumber
      } as RptIdFromString,
      importoSingoloVersamento: 9905 as ImportoEuroCents,
      codiceContestoPagamento: aCodiceContestoPagamento
    };

    const req = mockReq();

    // tslint:disable-next-line:no-object-mutation
    req.params = aPaymentActivationRequest;

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
});
