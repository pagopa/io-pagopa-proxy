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
import { INm3PortSoap } from "./IPPTPortSoap";

// WSDL path for PagamentiTelematiciPspNodo
export const PAGAMENTI_TELEMATICI_PSP_WSDL_PATH = `${__dirname}/../../wsdl/nodeForPsp.wsdl`;
export const PAGAMENTI_TELEMATICI_IO_WSDL_PATH = `${__dirname}/../../wsdl/nodeForIO.wsdl`;

/**
 * Create a client for PagamentiTelematiciPspNodo SOAP service
 * @param {soap.IOptions} options - Soap options
 * @return {Promise<soap.Client & INm3PortSoap>} Soap client created
 */
export function createNm3NodoPspClient(
  options: soap.IOptions,
  cert?: string,
  key?: string,
  hostHeader?: string
): Promise<soap.Client & INm3PortSoap> {
  return createClient<INm3PortSoap>(
    PAGAMENTI_TELEMATICI_PSP_WSDL_PATH,
    options,
    cert,
    key,
    hostHeader
  );
}

/**
 * Create a client for PagamentiTelematiciPspNodo SOAP service
 * @param {soap.IOptions} options - Soap options
 * @return {Promise<soap.Client & INm3PortSoap>} Soap client created
 */
export function createNm3NodoIoClient(
  options: soap.IOptions,
  cert?: string,
  key?: string,
  hostHeader?: string
): Promise<soap.Client & INm3PortSoap> {
  return createClient<INm3PortSoap>(
    PAGAMENTI_TELEMATICI_IO_WSDL_PATH,
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
export class PagamentiTelematiciPspNm3NodoAsyncClient {
  public readonly verifyPaymentNotice = promisifySoapMethod(
    this.client.verifyPaymentNotice
  );
  public readonly activateIOPayment = flip(
    curry(promisifySoapMethod(this.client.activateIOPayment))
  )({ postProcess: fixImportoSingoloVersamentoDigits }); // TODO PS-SI verify

  constructor(private readonly client: INm3PortSoap) {}
}
