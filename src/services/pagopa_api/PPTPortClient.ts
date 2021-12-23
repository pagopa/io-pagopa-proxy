/**
 * Define SOAP Clients to call PPTPort services provided by PagoPa
 */

import * as soap from "soap";
import { nodoAttivaRPTRisposta_element_ppt } from "../../../generated/PagamentiTelematiciPspNodoservice/nodoAttivaRPTRisposta_element_ppt";
import { nodoAttivaRPT_element_ppt } from "../../../generated/PagamentiTelematiciPspNodoservice/nodoAttivaRPT_element_ppt";

import {
  createClient,
  fixImportoSingoloVersamentoDigits,
  promisifySoapMethod
} from "../../utils/SoapUtils";
import { IPPTPortSoap } from "./IPPTPortSoap";

// WSDL path for PagamentiTelematiciPspNodo
export const PAGAMENTI_TELEMATICI_PSP_WSDL_PATH = `${__dirname}/../../wsdl/NodoPerPsp.wsdl`;

/**
 * Create a client for PagamentiTelematiciPspNodo SOAP service
 *
 * @param {soap.IOptions} options - Soap options
 * @return {Promise<soap.Client & IPPTPortSoap>} Soap client created
 */
// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function createPagamentiTelematiciPspNodoClient(
  options: soap.IOptions,
  cert?: string,
  key?: string,
  hostHeader?: string
): Promise<soap.Client & IPPTPortSoap> {
  return createClient<IPPTPortSoap>(
    PAGAMENTI_TELEMATICI_PSP_WSDL_PATH,
    options,
    cert,
    key,
    hostHeader
  );
}

/**
 * Converts the callback based methods of a PagamentiTelematiciPspNodo client to
 * promise based methods.
 */
export class PagamentiTelematiciPspNodoAsyncClient {
  constructor(private readonly client: IPPTPortSoap) {}

  public readonly nodoAttivaRPT: (
    input: nodoAttivaRPT_element_ppt
  ) => Promise<nodoAttivaRPTRisposta_element_ppt> = (
    input: nodoAttivaRPT_element_ppt
  ) =>
    // eslint-disable-next-line no-invalid-this
    promisifySoapMethod(this.client.nodoAttivaRPT)(input, {
      postProcess: fixImportoSingoloVersamentoDigits
    });

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public readonly nodoVerificaRPT = promisifySoapMethod(
    // eslint-disable-next-line no-invalid-this
    this.client.nodoVerificaRPT
  );
}
