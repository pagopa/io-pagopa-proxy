/**
 * Payment Controllers
 * Controllers for Payments Endpoints
 */

import * as express from "express";
import { CDAvvisiConfig, PagoPaConfig } from "../Configuration";
import { ControllerError } from "../enums/ControllerError";
import { HttpErrorStatusCode } from "../enums/HttpErrorStatusCode";
import { PaymentsStatusUpdateRequestPagoPa } from "../FakePagoPaExternalTypes";
import * as PaymentsService from "../services/PaymentsService";
import { PaymentsActivationRequest } from "../types/controllers/PaymentsActivationRequest";
import { PaymentsCheckRequest } from "../types/controllers/PaymentsCheckRequest";
import * as PaymentsConverter from "../utils/converters/PaymentsConverter";
import * as RestfulUtils from "../utils/RestfulUtils";

// Forward a payment check request from CD App to PagoPa API
export async function checkPayment(
  req: express.Request,
  res: express.Response,
  pagoPaConfig: PagoPaConfig
): Promise<boolean> {
  // Validate input
  const errorOrPaymentsCheckRequest = PaymentsCheckRequest.decode(req.params);
  if (errorOrPaymentsCheckRequest.isLeft()) {
    RestfulUtils.sendErrorResponse(
      res,
      ControllerError.ERROR_INVALID_INPUT,
      HttpErrorStatusCode.BAD_REQUEST
    );
    return false;
  }

  // Convert controller request to PagoPaAPI request
  const errorOrPaymentCheckRequestPagoPa = PaymentsConverter.getPaymentsCheckRequestPagoPa(
    errorOrPaymentsCheckRequest.value
  );
  if (errorOrPaymentCheckRequestPagoPa.isLeft()) {
    RestfulUtils.sendErrorResponse(
      res,
      ControllerError.ERROR_INVALID_INPUT,
      HttpErrorStatusCode.BAD_REQUEST
    );
  }

  // Require payment check to PagoPa API
  const errorOrPaymentCheckPagoPaResponse = await PaymentsService.sendPaymentCheckToPagoPaAPI(
    errorOrPaymentCheckRequestPagoPa.value,
    pagoPaConfig
  );

  // Provide a response to applicant if error occurred
  if (errorOrPaymentCheckPagoPaResponse.isLeft()) {
    if (
      errorOrPaymentCheckPagoPaResponse.value ===
      ControllerError.ERROR_API_UNAVAILABLE
    ) {
      RestfulUtils.sendUnavailableAPIError(res);
    } else {
      RestfulUtils.sendErrorResponse(
        res,
        ControllerError.ERROR_INVALID_INPUT,
        HttpErrorStatusCode.BAD_REQUEST
      );
    }
    return false;
  }

  // Convert PagoPaAPI response to controller response
  const errorOrPaymentCheckResponse = PaymentsConverter.getPaymentsCheckResponse(
    errorOrPaymentCheckPagoPaResponse.value
  );
  if (errorOrPaymentCheckResponse.isLeft()) {
    RestfulUtils.sendErrorResponse(
      res,
      ControllerError.ERROR_INVALID_INPUT,
      HttpErrorStatusCode.INTERNAL_ERROR
    );
    return false;
  }
  RestfulUtils.sendSuccessResponse(res, errorOrPaymentCheckResponse.value);
  return true;
}

// Forward a payment check request from CD App to PagoPa API
export async function activatePayment(
  req: express.Request,
  res: express.Response,
  pagoPaConfig: PagoPaConfig
): Promise<boolean> {
  // Validate input
  const errorOrPaymentsActivationRequest = PaymentsActivationRequest.decode(
    req.params
  );
  if (errorOrPaymentsActivationRequest.isLeft()) {
    RestfulUtils.sendErrorResponse(
      res,
      ControllerError.ERROR_INVALID_INPUT,
      HttpErrorStatusCode.BAD_REQUEST
    );
    return false;
  }

  // Convert controller request to PagoPaAPI request
  const errorOrPaymentsActivationRequestPagoPa = PaymentsConverter.getPaymentsActivationRequestPagoPa(
    errorOrPaymentsActivationRequest.value
  );
  if (errorOrPaymentsActivationRequestPagoPa.isLeft()) {
    RestfulUtils.sendErrorResponse(
      res,
      ControllerError.ERROR_INVALID_INPUT,
      HttpErrorStatusCode.BAD_REQUEST
    );
  }

  // Require payment activation to PagoPa API
  const errorOrPaymentActivationPagoPaResponse = await PaymentsService.sendPaymentsActivationToPagoPaAPI(
    errorOrPaymentsActivationRequestPagoPa.value,
    pagoPaConfig
  );

  // Provide a response to applicant
  if (errorOrPaymentActivationPagoPaResponse.isLeft()) {
    if (
      errorOrPaymentActivationPagoPaResponse.value ===
      ControllerError.ERROR_API_UNAVAILABLE
    ) {
      RestfulUtils.sendUnavailableAPIError(res);
    } else {
      RestfulUtils.sendErrorResponse(
        res,
        ControllerError.ERROR_INVALID_INPUT,
        HttpErrorStatusCode.BAD_REQUEST
      );
    }
    return false;
  }
  RestfulUtils.sendSuccessResponse(res);
  return true;
}

// Forward a payment status update from PagoPA API to CDAvvisi API
export async function notifyPaymentStatus(
  req: express.Request,
  res: express.Response,
  cdAvvisiConfig: CDAvvisiConfig
): Promise<boolean> {
  // Check input
  const errorOrPaymentsStatusUpdateRequestPagoPa = PaymentsStatusUpdateRequestPagoPa.decode(
    req.params
  );
  if (errorOrPaymentsStatusUpdateRequestPagoPa.isLeft()) {
    RestfulUtils.sendErrorResponse(
      res,
      ControllerError.ERROR_INVALID_INPUT,
      HttpErrorStatusCode.BAD_REQUEST
    );
    return false;
  }

  // Convert PagoPaAPI request to CD Avvisi API request
  const errorOrPaymentsStatusUpdateRequest = PaymentsConverter.getPaymentsStatusUpdateRequest(
    errorOrPaymentsStatusUpdateRequestPagoPa.value
  );
  if (errorOrPaymentsStatusUpdateRequest.isLeft()) {
    RestfulUtils.sendErrorResponse(
      res,
      ControllerError.ERROR_INVALID_INPUT,
      HttpErrorStatusCode.BAD_REQUEST
    );
  }

  // Forward request to API Avvisi (CD)
  const errorOrApiResponse = await PaymentsService.sendPaymentsStatusUpdateToAPIAvvisi(
    errorOrPaymentsStatusUpdateRequest.value,
    cdAvvisiConfig
  );

  // Provide a response to PagoPa API (Avvisatura)
  if (errorOrApiResponse.isLeft()) {
    RestfulUtils.sendUnavailableAPIError(res);
    return false;
  }
  RestfulUtils.sendSuccessResponse(res);
  return true;
}
