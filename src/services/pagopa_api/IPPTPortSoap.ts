/**
 * Handler interface for PPTPortType SOAP Endpoint
 */

import { nodoAttivaRPT_element_ppt } from "../../../generated/PagamentiTelematiciPspNodoservice/nodoAttivaRPT_element_ppt";
import { nodoAttivaRPTRisposta_element_ppt } from "../../../generated/PagamentiTelematiciPspNodoservice/nodoAttivaRPTRisposta_element_ppt";
import { nodoVerificaRPT_element_ppt } from "../../../generated/PagamentiTelematiciPspNodoservice/nodoVerificaRPT_element_ppt";
import { nodoVerificaRPTRisposta_element_ppt } from "../../../generated/PagamentiTelematiciPspNodoservice/nodoVerificaRPTRisposta_element_ppt";

import { activateIOPaymentReq_element_nfpsp } from "../../../generated/nodeNm3io/activateIOPaymentReq_element_nfpsp";
import { activateIOPaymentRes_element_nfpsp } from "../../../generated/nodeNm3io/activateIOPaymentRes_element_nfpsp";

import { verifyPaymentNoticeReq_element_nfpsp } from "../../../generated/nodeNm3psp/verifyPaymentNoticeReq_element_nfpsp";
import { verifyPaymentNoticeRes_element_nfpsp } from "../../../generated/nodeNm3psp/verifyPaymentNoticeRes_element_nfpsp";

import { SoapMethodCB } from "../../utils/SoapUtils";

export interface IPPTPortSoap {
  readonly nodoVerificaRPT: SoapMethodCB<
    nodoVerificaRPT_element_ppt,
    nodoVerificaRPTRisposta_element_ppt
  >;
  readonly nodoAttivaRPT: SoapMethodCB<
    nodoAttivaRPT_element_ppt,
    nodoAttivaRPTRisposta_element_ppt
  >;
}

export interface INm3PortSoap {
  readonly verifyPaymentNotice: SoapMethodCB<
    verifyPaymentNoticeReq_element_nfpsp,
    verifyPaymentNoticeRes_element_nfpsp
  >;
  readonly activateIOPayment: SoapMethodCB<
    activateIOPaymentReq_element_nfpsp,
    activateIOPaymentRes_element_nfpsp
  >;
}
