/**
 * Payment Controllers
 * Controllers for Payments Endpoints
 */

import * as express from "express";
import {
  IcdInfoWispInput,
  IcdInfoWispOutput
} from "italia-pagopa-api/wsdl-lib/PagamentiTelematiciPSPNodoService/PPTPort";

import { ControllerError } from "../enums/ControllerError";
import { HttpErrorStatusCode } from "../enums/HttpErrorStatusCode";
import { EsitoType } from "../enums/PagoPaEnumTypes";
import * as PaymentsService from "../services/PaymentsService";
import { PaymentsActivationRequest } from "../types/controllers/PaymentsActivationRequest";
import { PaymentsCheckRequest } from "../types/controllers/PaymentsCheckRequest";
import * as PaymentsConverter from "../utils/converters/PaymentsConverter";
import * as RestfulUtils from "../utils/RestfulUtils";

// Forward a payment check request from CD App to PagoPa API
export async function checkPayment(
  req: express.Request,
  res: express.Response
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
    return false;
  }

  // Require payment check to PagoPa API
  const errorOrPaymentCheckPagoPaResponse = await PaymentsService.sendPaymentCheckRequestToPagoPaAPI(
    errorOrPaymentCheckRequestPagoPa.value
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
  res: express.Response
  // pagoPaConfig: PagoPaConfig
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
    return false;
  }

  // Require payment activation to PagoPa API
  const errorOrPaymentActivationPagoPaResponse = await PaymentsService.sendPaymentsActivationRequestToPagoPaAPI();
  /* errorOrPaymentsActivationRequestPagoPa.value,
    pagoPaConfig)*/
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
  cdInfoWispInput: IcdInfoWispInput
  // cdAvvisiConfig: CDAvvisiConfig
): Promise<IcdInfoWispOutput> {
  // Convert PagoPaAPI request to CD Avvisi API request
  const errorOrPaymentsStatusUpdateRequest = PaymentsConverter.getPaymentsStatusUpdateRequest(
    cdInfoWispInput
  );
  if (errorOrPaymentsStatusUpdateRequest.isLeft()) {
    return {
      esito: EsitoType.KO
    };
  }

  // Forward request to API Avvisi (CD)
  const errorOrApiResponse = await PaymentsService.sendPaymentsStatusUpdateToAPIAvvisi();

  // Provide a response to PagoPa API (Avvisatura)
  if (errorOrApiResponse.isLeft()) {
    return {
      esito: EsitoType.KO
    };
  }
  return {
    esito: EsitoType.OK
  };
}
