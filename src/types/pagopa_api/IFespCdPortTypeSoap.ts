/**
 * Handler interface for FespCdPortType SOAP Endpoint
 */

// tslint:disable:no-any

import * as t from "io-ts";
import { cdInfoPagamento_ppt } from "./yaml-to-ts/cdInfoPagamento_ppt";
import { cdInfoPagamentoResponse_ppt } from "./yaml-to-ts/cdInfoPagamentoResponse_ppt";

export interface IFespCdPortTypeSoap {
  readonly cdInfoPagamento: (
    input: cdInfoPagamento_ppt,
    cb: (
      result: cdInfoPagamentoResponse_ppt,
      err?: any,
      raw?: t.StringType,
      soapHeader?: { readonly [k: string]: any }
    ) => any
  ) => void;
}
