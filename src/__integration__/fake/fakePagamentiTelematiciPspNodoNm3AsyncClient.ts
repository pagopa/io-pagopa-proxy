import { reporters } from "italia-ts-commons";
import * as soap from "soap";
import { INm3PortSoap } from "../../services/pagopa_api/IPPTPortSoap";
import * as NodoNM3PortClient from "../../services/pagopa_api/NodoNM3PortClient";
import { createClient } from "../../utils/SoapUtils";

import { verifyPaymentNoticeReq_nfpsp } from "../../../generated/nodeNm3psp/verifyPaymentNoticeReq_nfpsp";
import { verifyPaymentNoticeRes_nfpsp } from "../../../generated/nodeNm3psp/verifyPaymentNoticeRes_nfpsp";

const invalidInput = "Invalid input";

export async function createPagamentiTelematiciPspNm3NodoClient(
  options: soap.IOptions
): Promise<soap.Client & INm3PortSoap> {
  return createClient<INm3PortSoap>(
    NodoNM3PortClient.PAGAMENTI_TELEMATICI_PSP_WSDL_PATH,
    options
  );
}

const aVerifyPaymnentNoticeResOK = verifyPaymentNoticeRes_nfpsp
  .decode({
    outcome: "OK",
    paymentList: {
      paymentOptionDescription: [
        {
          amount: 30.0,
          options: "EQ",
          paymentNote: "paymentNoteTest"
        }
      ]
    },
    paymentDescription: "payment",
    fiscalCodePA: "77777777777",
    companyName: "company EC",
    officeName: "office EC"
  })
  .getOrElseL(errors => {
    throw Error(
      `Invalid verifyPaymentNoticeRes to decode: ${reporters.readableReport(
        errors
      )}`
    );
  });

export class FakePagamentiTelematiciPspNodoNm3PspAsyncClient extends NodoNM3PortClient.PagamentiTelematiciPspNm3NodoAsyncClient {
  constructor(client: INm3PortSoap) {
    super(client);
  }
  public readonly verifyPaymentNotice = (
    input: verifyPaymentNoticeReq_nfpsp
  ) => {
    return new Promise<verifyPaymentNoticeRes_nfpsp>((resolve, reject) => {
      if (input !== undefined) {
        resolve(aVerifyPaymnentNoticeResOK);
      } else {
        reject(invalidInput);
      }
    });
  };
}
