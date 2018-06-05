/**
 * PaymentControllers
 * RESTful Controllers for Payments Endpoints
 */

import * as express from "express";
import { ControllerError } from "../../enums/ControllerError";
import { HttpErrorStatusCode } from "../../enums/HttpErrorStatusCode";
import * as PaymentsService from "../../services/PaymentsService";
import { PaymentsActivationRequest } from "../../types/controllers/PaymentsActivationRequest";
import { PaymentsCheckRequest } from "../../types/controllers/PaymentsCheckRequest";
import * as PaymentsConverter from "../../utils/PaymentsConverter";
import * as RestfulUtils from "../../utils/RestfulUtils";

// Forward a payment check request from BackendApp to PagoPa
export async function checkPaymentToPagoPa(
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

  // Generate a session token (this is the first message of a payment flow)
  const errorOrCodiceContestoPagamento = PaymentsConverter.generateCodiceContestoPagamento();
  if (errorOrCodiceContestoPagamento.isLeft()) {
    RestfulUtils.sendErrorResponse(
      res,
      ControllerError.ERROR_INVALID_INPUT,
      HttpErrorStatusCode.INTERNAL_ERROR
    );
    return false;
  }

  // Convert controller request to PagoPa request
  const errorOrPaymentCheckRequestPagoPa = PaymentsConverter.getPaymentsCheckRequestPagoPa(
    errorOrPaymentsCheckRequest.value,
    errorOrCodiceContestoPagamento.value
  );
  if (errorOrPaymentCheckRequestPagoPa.isLeft()) {
    RestfulUtils.sendErrorResponse(
      res,
      ControllerError.ERROR_INVALID_INPUT,
      HttpErrorStatusCode.BAD_REQUEST
    );
    return false;
  }

  // Require payment check to PagoPa
  const errorOrPaymentCheckPagoPaResponse = await PaymentsService.sendPaymentCheckRequestToPagoPa(
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

  // Convert PagoPa response to controller response
  const errorOrPaymentCheckResponse = PaymentsConverter.getPaymentsCheckResponse(
    errorOrPaymentCheckPagoPaResponse.value,
    errorOrCodiceContestoPagamento.value
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

// Forward a payment check request from BackendApp to PagoPa
export async function activatePaymentToPagoPa(
  req: express.Request,
  res: express.Response
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

  // Convert controller request to PagoPa request
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

  // Require payment activation to PagoPa
  const errorOrPaymentActivationPagoPaResponse = await PaymentsService.sendPaymentsActivationRequestToPagoPa();

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

  // Convert PagoPa response to controller response
  const errorOrPaymentActivationResponse = PaymentsConverter.getPaymentsActivationResponse(
    errorOrPaymentActivationPagoPaResponse.value
  );
  if (errorOrPaymentActivationResponse.isLeft()) {
    RestfulUtils.sendErrorResponse(
      res,
      ControllerError.ERROR_INVALID_INPUT,
      HttpErrorStatusCode.INTERNAL_ERROR
    );
    return false;
  }
  RestfulUtils.sendSuccessResponse(res, errorOrPaymentActivationResponse.value);
  return true;
}

// Forward a payment status update from PagoPa to API Notifica
export async function notifyPaymentStatusToAPINotifica(): Promise<boolean> {
  // TODO: [#157910857] Creazione dei controller SOAP per l'esposizione dei servizi verso PagoPa
  return false;
}
