import { reporters } from "@pagopa/ts-commons";
import * as soap from "soap";
import { INm3PortSoap } from "../../services/pagopa_api/IPPTPortSoap";
import * as NodoNM3PortClient from "../../services/pagopa_api/NodoNM3PortClient";
import { createClient } from "../../utils/SoapUtils";

import { verifyPaymentNoticeReq_element_nfpsp } from "../../../generated/nodeNm3psp/verifyPaymentNoticeReq_element_nfpsp";
import { verifyPaymentNoticeRes_element_nfpsp } from "../../../generated/nodeNm3psp/verifyPaymentNoticeRes_element_nfpsp";
import { pipe } from "fp-ts/lib/function";
import * as E from "fp-ts/Either";
import { activateIOPaymentReq_element_nfpsp } from "../../../generated/nodeNm3io/activateIOPaymentReq_element_nfpsp";
import { activateIOPaymentRes_element_nfpsp } from "../../../generated/nodeNm3io/activateIOPaymentRes_element_nfpsp";

const invalidInput = "Invalid input";

export async function createPagamentiTelematiciPspNm3NodoClient(
  options: soap.IOptions
): Promise<soap.Client & INm3PortSoap> {
  return createClient<INm3PortSoap>(
    NodoNM3PortClient.PAGAMENTI_TELEMATICI_PSP_WSDL_PATH,
    options
  );
}

const endNM3KoWithouDetailsResponse  = "55";
const endNM3TimeoutResponse          = "66";
const endNM3PagamentoInCorsoResponse = "77";

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

const koWithouDetailsResponse =  pipe(
  verifyPaymentNoticeRes_element_nfpsp.decode({
    outcome: "KO"
  }),
  E.getOrElseW(errors => {
    throw Error(
      `Invalid verifyPaymentNoticeRes_element_nfpsp to decode: ${reporters.readableReport(
        errors
      )}`
    );
  })
);

const koPagamentoInCorsoResponse =  pipe(
  verifyPaymentNoticeRes_element_nfpsp.decode({
    outcome: "KO",
    fault:{ 
      faultCode: "PAA_PAGAMENTO_IN_CORSO",
      faultString: "Pagamento in corso", 
      id: "PAA_PAGAMENTO_IN_CORSO" 
    }
  }),
  E.getOrElseW(errors => {
    throw Error(
      `Invalid verifyPaymentNoticeRes_element_nfpsp to decode: ${reporters.readableReport(
        errors
      )}`
    );
  })
);

const activatePaymnentNoticeResOK = pipe(
  activateIOPaymentRes_element_nfpsp.decode({
    outcome: "OK",
    paymentToken: "e20862b163264a70bee5271111d115ed",
    totalAmount: 1000,
    paymentDescription : "payment description"
  }),
  E.getOrElseW(errors => {
    throw Error(
      `Invalid verifyPaymentNoticeRes to decode: ${reporters.readableReport(
        errors
      )}`
    );
  })
);

const koWithouDetailsActivateResponse =  pipe(
  activateIOPaymentRes_element_nfpsp.decode({
    outcome: "KO"
  }),
  E.getOrElseW(errors => {
    throw Error(
      `Invalid verifyPaymentNoticeRes_element_nfpsp to decode: ${reporters.readableReport(
        errors
      )}`
    );
  })
);

const koPagamentoInCorsoActivateResponse =  pipe(
  activateIOPaymentRes_element_nfpsp.decode({
    outcome: "KO",
    fault:{ 
      faultCode: "PAA_PAGAMENTO_IN_CORSO",
      faultString: "Pagamento in corso", 
      id: "PAA_PAGAMENTO_IN_CORSO" 
    }
  }),
  E.getOrElseW(errors => {
    throw Error(
      `Invalid verifyPaymentNoticeRes_element_nfpsp to decode: ${reporters.readableReport(
        errors
      )}`
    );
  })
);

const timeoutResponse       = {
  message: "ESOCKETTIMEDOUT"
};

export class FakePagamentiTelematiciPspNodoNm3PspAsyncClient extends NodoNM3PortClient.PagamentiTelematiciPspNm3NodoAsyncClient {
  constructor(client: INm3PortSoap, timeout: number) {
    super(client, timeout);
  }
  public readonly verifyPaymentNotice = (
    input: verifyPaymentNoticeReq_element_nfpsp
  ) => {
    return new Promise<verifyPaymentNoticeRes_element_nfpsp>((resolve, reject) => {
      const iuv = input.qrCode.noticeNumber;
      if (iuv.endsWith(endNM3KoWithouDetailsResponse)) {
        resolve(koWithouDetailsResponse);
      } else if ( iuv.endsWith(endNM3TimeoutResponse) ) {
        reject(timeoutResponse);
      } else if ( iuv.endsWith(endNM3PagamentoInCorsoResponse) ) {
        resolve(koPagamentoInCorsoResponse);
      }else if (input !== undefined) {
        resolve(aVerifyPaymnentNoticeResOK);
      } else {
        reject(invalidInput);
      }
    });
  };
  
  public readonly activateIOPayment = (
    input: activateIOPaymentReq_element_nfpsp
  ) => {
    return new Promise<activateIOPaymentRes_element_nfpsp>((resolve, reject) => {
      const iuv = input.qrCode.noticeNumber;
      if (iuv.endsWith(endNM3KoWithouDetailsResponse)) {
        resolve(koWithouDetailsActivateResponse);
      } else if ( iuv.endsWith(endNM3TimeoutResponse) ) {
        reject(timeoutResponse);
      } else if ( iuv.endsWith(endNM3PagamentoInCorsoResponse) ) {
        resolve(koPagamentoInCorsoActivateResponse);
      }else if (input !== undefined) {
        resolve(activatePaymnentNoticeResOK);
      } else {
        reject(invalidInput);
      }
    });
  };
  
}
