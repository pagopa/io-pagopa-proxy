/**
 * Define FespCd SOAP Servers to expose to PagoPa
 */

import * as core from "express-serve-static-core";
import { NonEmptyString } from "italia-ts-commons/lib/strings";
import * as soap from "soap";

import { readWsdl } from "../../utils/SoapUtils";

// WSDL path for FespCd
const FESP_CD_WSDL_PATH = `${__dirname}/../../wsdl/CdPerNodo.wsdl` as NonEmptyString;

/**
 * Attach FespCd SOAP service to a server instance
 *
 * @param {core.Express} server - The server instance to use to expose services
 * @param {NonEmptyString} path - The endpoint path
 * @param {IFespCdPortTypeSoap} fespCdHandlers - The service controller
 * @return {Promise<soap.Server>} The soap server defined and started
 */
export async function attachFespCdServer(
  server: core.Express,
  path: NonEmptyString,
  fespCdHandlers: soap.IServicePort
): Promise<soap.Server> {
  const wsdl = await readWsdl(FESP_CD_WSDL_PATH);
  const service = {
    FespCdService: {
      FespCdPortType: fespCdHandlers
    }
  };
  return soap.listen(server, path, service, wsdl);
}
