/**
 * Handler interface for PPTPortType SOAP Endpoint
 */

// tslint:disable:no-any

import { nodoAttivaRPT_ppt } from "../../../generated/PagamentiTelematiciPspNodoservice/nodoAttivaRPT_ppt";
import { nodoAttivaRPTRisposta_ppt } from "../../../generated/PagamentiTelematiciPspNodoservice/nodoAttivaRPTRisposta_ppt";
import { nodoVerificaRPT_ppt } from "../../../generated/PagamentiTelematiciPspNodoservice/nodoVerificaRPT_ppt";
import { nodoVerificaRPTRisposta_ppt } from "../../../generated/PagamentiTelematiciPspNodoservice/nodoVerificaRPTRisposta_ppt";
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
