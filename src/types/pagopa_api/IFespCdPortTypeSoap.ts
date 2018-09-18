/**
 * Handler interface for FespCdPortType SOAP Endpoint
 */

// tslint:disable:no-any

import * as t from "io-ts";
import { cdInfoWisp_ppt } from "./yaml-to-ts/cdInfoWisp_ppt";
import { cdInfoWispResponse_ppt } from "./yaml-to-ts/cdInfoWispResponse_ppt";

export interface IFespCdPortTypeSoap {
  readonly cdInfoWisp: (
    input: cdInfoWisp_ppt,
    cb: (
      result: cdInfoWispResponse_ppt,
      err?: any,
      raw?: t.StringType,
      soapHeader?: { readonly [k: string]: any }
    ) => any
  ) => void;
}
