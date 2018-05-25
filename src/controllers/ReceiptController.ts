/**
 * Receipt Controllers
 * Controllers for Receipts Endpoints
 */

import * as express from "express";
import { CDAvvisiConfig } from "../Configuration";
import { ControllerError } from "../enums/ControllerError";
import { HttpErrorStatusCode } from "../enums/HttpErrorStatusCode";
import { ReceiptsDispatchRequestPagoPa } from "../FakePagoPaExternalTypes";
import * as ReceiptsService from "../services/ReceiptsService";
import * as ReceiptsConverter from "../utils/converters/ReceiptsConverter";
import * as RestfulUtils from "../utils/RestfulUtils";

// Forward new receipts from PagoPa API to CDAvvisi API
export async function dispatchReceipt(
  req: express.Request,
  res: express.Response,
  cdAvvisiConfig: CDAvvisiConfig
): Promise<boolean> {
  // Check input
  const errorOrReceiptsDispatchRequestPagoPa = ReceiptsDispatchRequestPagoPa.decode(
    req.params
  );
  if (errorOrReceiptsDispatchRequestPagoPa.isLeft()) {
    RestfulUtils.sendErrorResponse(
      res,
      ControllerError.ERROR_INVALID_INPUT,
      HttpErrorStatusCode.BAD_REQUEST
    );
    return false;
  }

  // Convert PagoPaAPI request to CD Avvisi API request
  const errorOrReceiptsDispatchRequest = ReceiptsConverter.getReceiptsDispatchRequest(
    errorOrReceiptsDispatchRequestPagoPa.value
  );
  if (errorOrReceiptsDispatchRequest.isLeft()) {
    RestfulUtils.sendErrorResponse(
      res,
      ControllerError.ERROR_INVALID_INPUT,
      HttpErrorStatusCode.BAD_REQUEST
    );
  }

  // Forward request to API Avvisi (CD)
  const errorOrReceiptsDispatchResponse = await ReceiptsService.sendReceiptsDispatchRequestToAPIAvvisi(
    errorOrReceiptsDispatchRequest.value,
    cdAvvisiConfig
  );

  // Provide a response to PagoPa API (Avvisatura)
  if (errorOrReceiptsDispatchResponse.isLeft()) {
    RestfulUtils.sendUnavailableAPIError(res);
    return false;
  }
  RestfulUtils.sendSuccessResponse(res);
  return true;
}
