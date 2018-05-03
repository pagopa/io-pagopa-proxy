/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 */

import * as express from "express";
import { StatusCode } from "../types/StatusCode";

// Utils used by Controllers
export class ControllerUtils {
  // Set an error message for express response
  public static setErrorResponse(res: express.Response, error: Error): void {
    res.status(500).json({ status: StatusCode.ERROR, message: error.message });
  }

  // Set a success message for express response
  public static setSuccessResponse(
    res: express.Response,
    content: IRestfulObject
  ): void {
    content.status = StatusCode.OK; // tslint:disable-line
    res.status(200).json(content);
  }
}

interface IRestfulObject {
  [key: string]: any // tslint:disable-line
}
