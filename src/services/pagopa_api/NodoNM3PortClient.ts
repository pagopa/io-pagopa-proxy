/**
 * Define SOAP Clients to call PPTPort services provided by PagoPa
 */

import * as soap from "soap";
import { activateIOPaymentReq_element_nfpsp } from "../../../generated/nodeNm3io/activateIOPaymentReq_element_nfpsp";
import { activateIOPaymentRes_element_nfpsp } from "../../../generated/nodeNm3io/activateIOPaymentRes_element_nfpsp";

import {
  createClient,
  fixAmountDigits,
  promisifySoapMethod
} from "../../utils/SoapUtils";
import { INm3PortSoap } from "./IPPTPortSoap";

// WSDL path for PagamentiTelematiciPspNodo
export const PAGAMENTI_TELEMATICI_PSP_WSDL_PATH = `${__dirname}/../../wsdl/nodeForPsp.wsdl`;
export const PAGAMENTI_TELEMATICI_IO_WSDL_PATH = `${__dirname}/../../wsdl/nodeForIO.wsdl`;

/**
 * Create a client for PagamentiTelematiciPspNodo SOAP service
 *
 * @param {soap.IOptions} options - Soap options
 * @return {Promise<soap.Client & INm3PortSoap>} Soap client created
 */
// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
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
 *
 * @param {soap.IOptions} options - Soap options
 * @return {Promise<soap.Client & INm3PortSoap>} Soap client created
 */
// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
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
  constructor(private readonly client: INm3PortSoap) {}

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public readonly verifyPaymentNotice = promisifySoapMethod(
    // eslint-disable-next-line no-invalid-this
    this.client.verifyPaymentNotice
  );

  public readonly activateIOPayment: (
    input: activateIOPaymentReq_element_nfpsp
  ) => Promise<activateIOPaymentRes_element_nfpsp> = (
    input: activateIOPaymentReq_element_nfpsp
  ) =>
    // eslint-disable-next-line no-invalid-this
    promisifySoapMethod(this.client.activateIOPayment)(input, {
      postProcess: fixAmountDigits
    });
}
