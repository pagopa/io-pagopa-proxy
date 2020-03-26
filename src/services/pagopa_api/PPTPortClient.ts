/**
 * Define SOAP Clients to call PPTPort services provided by PagoPa
 */

import { curry, flip } from "fp-ts/lib/function";
import * as soap from "soap";

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
 * @param {soap.IOptions} options - Soap options
 * @return {Promise<soap.Client & IPPTPortSoap>} Soap client created
 */
export function createPagamentiTelematiciPspNodoClient(
  options: soap.IOptions,
  cert: string,
  key: string,
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
  public readonly nodoVerificaRPT = promisifySoapMethod(
    this.client.nodoVerificaRPT
  );
  public readonly nodoAttivaRPT = flip(
    curry(promisifySoapMethod(this.client.nodoAttivaRPT))
  )({ postProcess: fixImportoSingoloVersamentoDigits });
  constructor(private readonly client: IPPTPortSoap) {}
}
