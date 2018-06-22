//tslint:disable
import { isRight } from "fp-ts/lib/Either";
import { PPTPortTypes } from "italia-pagopa-api/dist/wsdl-lib/PagamentiTelematiciPspNodoservice/PPTPort";
import {
  ApplicationCode,
  AuxDigit,
  CheckDigit,
  IUV13,
  PaymentNoticeNumber,
  RptId
} from "italia-ts-commons/lib/pagopa";

import { OrganizationFiscalCode } from "italia-ts-commons/lib/strings";
import "jest-xml-matcher";
import { PagoPAConfig } from "../Configuration";
import { paymentRequestsGet, paymentActivationsPost } from "../controllers/restful/PaymentController";
import { CodiceContestoPagamento } from "../types/CommonTypes";
import {
  createPagamentiTelematiciPspNodoClient,
  FakePagamentiTelematiciPspNodoAsyncClient
} from "./fake/fakePagamentiTelematiciPspNodoAsyncClient";
import mockReq from "./fake/request";
import { PaymentActivationsPostRequest } from "../types/api/PaymentActivationsPostRequest";
import { ImportoEuroCents } from "../types/api/ImportoEuroCents";
import { RptIdFromString } from "../types/api/RptIdFromString";

const aConfig = {
  HOST: process.env.PAGOPA_HOST || "http://localhost",
  PORT: process.env.PAGOPA_PORT || "3008",
  SERVICES: {
    VERIFICA_RPT: "nodoVerificaRPT",
    ATTIVA_RPT: "nodoAttivaRPT"
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
    const aPaymentCheckRequest: RptId = {
      organizationFiscalCode: "12345678901" as OrganizationFiscalCode,
      paymentNoticeNumber: {
        applicationCode: "99" as ApplicationCode,
        auxDigit: "0" as AuxDigit,
        checkDigit: "99" as CheckDigit,
        iuv13: "1234567890123" as IUV13
      } as PaymentNoticeNumber
    };

    const verificaRPTPagoPaClient = new FakePagamentiTelematiciPspNodoAsyncClient(
      await createPagamentiTelematiciPspNodoClient({
        envelopeKey: PPTPortTypes.envelopeKey
      })
    );

    const req = mockReq();

    req.params = aPaymentCheckRequest;

    const errorOrPaymentCheckResponse = await paymentRequestsGet(
      aConfig as PagoPAConfig,
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
        }
      );

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
  const aPaymentCheckRequest: RptId = {
    organizationFiscalCode: "1" as OrganizationFiscalCode,
    paymentNoticeNumber: {
      applicationCode: "99" as ApplicationCode,
      auxDigit: "0" as AuxDigit,
      checkDigit: "99" as CheckDigit,
      iuv13: "1234567890123" as IUV13
    } as PaymentNoticeNumber
  };

    const verificaRPTPagoPaClient = new FakePagamentiTelematiciPspNodoAsyncClient(
      await createPagamentiTelematiciPspNodoClient({
        envelopeKey: PPTPortTypes.envelopeKey
      })
    );

    const req = mockReq();

    req.params = aPaymentCheckRequest;

    const errorOrPaymentCheckResponse = await paymentRequestsGet(
      aConfig as PagoPAConfig,
      verificaRPTPagoPaClient
    )(req);

    expect(errorOrPaymentCheckResponse.kind).toBe("IResponseErrorValidation");
  });
});


describe("activatePaymentToPagoPa", async () => {
  it("should return the right response", async () => {
    const aPaymentActivationRequest: PaymentActivationsPostRequest = {
      rptId: {
        organizationFiscalCode: "12345678901" as OrganizationFiscalCode,
        paymentNoticeNumber: {
          applicationCode: "99" as ApplicationCode,
          auxDigit: "0" as AuxDigit,
          checkDigit: "99" as CheckDigit,
          iuv13: "1234567890123" as IUV13
        } as PaymentNoticeNumber,
      } as RptIdFromString,
      importoSingoloVersamento: 9905 as ImportoEuroCents,
      codiceContestoPagamento: aCodiceContestoPagamento
    }
  

    const attivaRPTPagoPaClient = new FakePagamentiTelematiciPspNodoAsyncClient(
      await createPagamentiTelematiciPspNodoClient({
        envelopeKey: PPTPortTypes.envelopeKey
      })
    );

    const req = mockReq();

    req.params = aPaymentActivationRequest;

    const errorOrPaymentActivationResponse = await paymentActivationsPost(
      aConfig as PagoPAConfig,
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
    const aPaymentActivationRequest: PaymentActivationsPostRequest = {
      rptId: {
        organizationFiscalCode: "XXX" as OrganizationFiscalCode,
        paymentNoticeNumber: {
          applicationCode: "99" as ApplicationCode,
          auxDigit: "0" as AuxDigit,
          checkDigit: "99" as CheckDigit,
          iuv13: "1234567890123" as IUV13
        } as PaymentNoticeNumber,
      } as RptIdFromString,
      importoSingoloVersamento: 9905 as ImportoEuroCents,
      codiceContestoPagamento: aCodiceContestoPagamento
    }
  


    const attivaRPTPagoPaClient = new FakePagamentiTelematiciPspNodoAsyncClient(
      await createPagamentiTelematiciPspNodoClient({
        envelopeKey: PPTPortTypes.envelopeKey
      })
    );

    const req = mockReq();

    req.params = aPaymentActivationRequest;

    const errorOrPaymentActivationResponse = (await paymentActivationsPost(
      aConfig as PagoPAConfig,
      attivaRPTPagoPaClient
    )(req))

    expect(errorOrPaymentActivationResponse.kind).toBe(
      "IResponseErrorValidation"
    );
  });
});

