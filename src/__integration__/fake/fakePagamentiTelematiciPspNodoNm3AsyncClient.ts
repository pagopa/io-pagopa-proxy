import { reporters } from "@pagopa/ts-commons";
import * as soap from "soap";
import { INm3PortSoap } from "../../services/pagopa_api/IPPTPortSoap";
import * as NodoNM3PortClient from "../../services/pagopa_api/NodoNM3PortClient";
import { createClient } from "../../utils/SoapUtils";

import { verifyPaymentNoticeReq_element_nfpsp } from "../../../generated/nodeNm3psp/verifyPaymentNoticeReq_element_nfpsp";
import { verifyPaymentNoticeRes_element_nfpsp } from "../../../generated/nodeNm3psp/verifyPaymentNoticeRes_element_nfpsp";
import { pipe } from "fp-ts/lib/function";
import * as E from "fp-ts/Either";

const invalidInput = "Invalid input";

export async function createPagamentiTelematiciPspNm3NodoClient(
  options: soap.IOptions
): Promise<soap.Client & INm3PortSoap> {
  return createClient<INm3PortSoap>(
    NodoNM3PortClient.PAGAMENTI_TELEMATICI_PSP_WSDL_PATH,
    options
  );
}

const aVerifyPaymnentNoticeResOK = pipe(
  verifyPaymentNoticeRes_element_nfpsp.decode({
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
  }),
  E.getOrElseW(errors => {
    throw Error(
      `Invalid verifyPaymentNoticeRes to decode: ${reporters.readableReport(
        errors
      )}`
    );
  })
);

export class FakePagamentiTelematiciPspNodoNm3PspAsyncClient extends NodoNM3PortClient.PagamentiTelematiciPspNm3NodoAsyncClient {
  constructor(client: INm3PortSoap, timeout: number) {
    super(client, timeout);
  }
  public readonly verifyPaymentNotice = (
    input: verifyPaymentNoticeReq_element_nfpsp
  ) => {
    return new Promise<verifyPaymentNoticeRes_element_nfpsp>((resolve, reject) => {
      if (input !== undefined) {
        resolve(aVerifyPaymnentNoticeResOK);
      } else {
        reject(invalidInput);
      }
    });
  };
}
