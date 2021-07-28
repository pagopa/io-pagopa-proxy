/**
 * Handler interface for PPTPortType SOAP Endpoint
 */

// tslint:disable:no-any

import { nodoAttivaRPT_ppt } from "../../../generated/PagamentiTelematiciPspNodoservice/nodoAttivaRPT_ppt";
import { nodoAttivaRPTRisposta_ppt } from "../../../generated/PagamentiTelematiciPspNodoservice/nodoAttivaRPTRisposta_ppt";
import { nodoVerificaRPT_ppt } from "../../../generated/PagamentiTelematiciPspNodoservice/nodoVerificaRPT_ppt";
import { nodoVerificaRPTRisposta_ppt } from "../../../generated/PagamentiTelematiciPspNodoservice/nodoVerificaRPTRisposta_ppt";

import { activateIOPaymentReq_nfpsp } from "../../../generated/nodeNm3io/activateIOPaymentReq_nfpsp";
import { activateIOPaymentRes_nfpsp } from "../../../generated/nodeNm3io/activateIOPaymentRes_nfpsp";

import { verifyPaymentNoticeReq_nfpsp } from "../../../generated/nodeNm3psp/verifyPaymentNoticeReq_nfpsp";
import { verifyPaymentNoticeRes_nfpsp } from "../../../generated/nodeNm3psp/verifyPaymentNoticeRes_nfpsp";

import { SoapMethodCB } from "../../utils/SoapUtils";

export interface IPPTPortSoap {
  readonly nodoVerificaRPT: SoapMethodCB<
    nodoVerificaRPT_ppt,
    nodoVerificaRPTRisposta_ppt
  >;
  readonly nodoAttivaRPT: SoapMethodCB<
    nodoAttivaRPT_ppt,
    nodoAttivaRPTRisposta_ppt
  >;
}

export interface INm3PortSoap {
  readonly verifyPaymentNotice: SoapMethodCB<
    verifyPaymentNoticeReq_nfpsp,
    verifyPaymentNoticeRes_nfpsp
  >;
  readonly activateIOPayment: SoapMethodCB<
    activateIOPaymentReq_nfpsp,
    activateIOPaymentRes_nfpsp
  >;
}
