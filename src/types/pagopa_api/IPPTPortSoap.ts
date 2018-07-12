/**
 * Handler interface for PPTPortType SOAP Endpoint
 */

// tslint:disable:no-any

import { nodoAttivaRPT_ppt } from "./yaml-to-ts/nodoAttivaRPT_ppt";
import { nodoAttivaRPTRisposta_ppt } from "./yaml-to-ts/nodoAttivaRPTRisposta_ppt";
import { nodoVerificaRPT_ppt } from "./yaml-to-ts/nodoVerificaRPT_ppt";
import { nodoVerificaRPTRisposta_ppt } from "./yaml-to-ts/nodoVerificaRPTRisposta_ppt";

export interface IPPTPortSoap {
  readonly nodoVerificaRPT: (
    input: nodoVerificaRPT_ppt,
    cb: (
      err: any,
      result: nodoVerificaRPTRisposta_ppt,
      raw: string,
      soapHeader: { readonly [k: string]: any }
    ) => any
  ) => void;
  readonly nodoAttivaRPT: (
    input: nodoAttivaRPT_ppt,
    cb: (
      err: any,
      result: nodoAttivaRPTRisposta_ppt,
      raw: string,
      soapHeader: { readonly [k: string]: any }
    ) => any
  ) => void;
}
