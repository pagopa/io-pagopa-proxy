/**
 * PaymentControllers
 * RESTful Controllers for Payments Endpoints
 */

import * as express from "express";
import { Either, left, right } from "fp-ts/lib/Either";
import {
  IcdInfoWispInput,
  IcdInfoWispOutput,
  PPTPortTypes
} from "italia-pagopa-api/dist/wsdl-lib/PagamentiTelematiciPspNodoservice/PPTPort";
import * as redis from "redis";
import { promisify } from "util";
import * as uuid from "uuid";
import { PagoPaConfig, RedisTimeout } from "../../Configuration";
import { ControllerError } from "../../enums/ControllerError";
import { HttpErrorStatusCode } from "../../enums/HttpErrorStatusCode";
import * as PaymentsService from "../../services/PaymentsService";
import { PaymentsActivationRequest } from "../../types/controllers/PaymentsActivationRequest";
import { PaymentsActivationResponse } from "../../types/controllers/PaymentsActivationResponse";
import { PaymentsActivationStatusCheckResponse } from "../../types/controllers/PaymentsActivationStatusCheckResponse";
import { PaymentsCheckRequest } from "../../types/controllers/PaymentsCheckRequest";
import { PaymentsCheckResponse } from "../../types/controllers/PaymentsCheckResponse";
import { CodiceContestoPagamento } from "../../types/PagoPaTypes";
import * as PaymentsConverter from "../../utils/PaymentsConverter";
import * as RestfulUtils from "../../utils/RestfulUtils";

// Forward a payment check request from BackendApp to PagoPa
export async function checkPaymentToPagoPa(
  req: express.Request,
  res: express.Response,
  pagoPaConfig: PagoPaConfig
): Promise<Either<ControllerError, PaymentsCheckResponse>> {
  // Validate input
  const errorOrPaymentsCheckRequest = PaymentsCheckRequest.decode(req.params);
  if (errorOrPaymentsCheckRequest.isLeft()) {
    return left(
      RestfulUtils.sendErrorResponse(
        res,
        ControllerError.ERROR_INVALID_INPUT,
        HttpErrorStatusCode.BAD_REQUEST
      )
    );
  }

  // Generate a session token (this is the first message of a payment flow)
  const errorOrCodiceContestoPagamento = generateCodiceContestoPagamento();
  if (errorOrCodiceContestoPagamento.isLeft()) {
    return left(
      RestfulUtils.sendErrorResponse(
        res,
        ControllerError.ERROR_INTERNAL,
        HttpErrorStatusCode.INTERNAL_ERROR
      )
    );
  }

  // Convert controller request to PagoPa request
  const errorOrPaymentCheckRequestPagoPa = PaymentsConverter.getPaymentsCheckRequestPagoPa(
    pagoPaConfig,
    errorOrPaymentsCheckRequest.value,
    errorOrCodiceContestoPagamento.value
  );
  if (errorOrPaymentCheckRequestPagoPa.isLeft()) {
    return left(
      RestfulUtils.sendErrorResponse(
        res,
        ControllerError.ERROR_INVALID_INPUT,
        HttpErrorStatusCode.BAD_REQUEST
      )
    );
  }

  // Require payment check to PagoPa
  const errorOrPaymentCheckPagoPaResponse = await PaymentsService.sendPaymentCheckRequestToPagoPa(
    errorOrPaymentCheckRequestPagoPa.value,
    pagoPaConfig
  );

  // Provide a response to applicant if error occurred
  if (errorOrPaymentCheckPagoPaResponse.isLeft()) {
    RestfulUtils.sendUnavailableAPIError(res);
    return left(ControllerError.ERROR_API_UNAVAILABLE);
  }

  // Check if request was rejected
  if (
    errorOrPaymentCheckPagoPaResponse.value.nodoVerificaRPTRisposta.esito ===
    PPTPortTypes.Esito.KO
  ) {
    return left(
      RestfulUtils.sendErrorResponse(
        res,
        ControllerError.REQUEST_REJECTED,
        HttpErrorStatusCode.BAD_REQUEST
      )
    );
  }

  // Convert PagoPa response to controller response
  const errorOrPaymentCheckResponse = PaymentsConverter.getPaymentsCheckResponse(
    errorOrPaymentCheckPagoPaResponse.value,
    errorOrCodiceContestoPagamento.value
  );
  if (errorOrPaymentCheckResponse.isLeft()) {
    return left(
      RestfulUtils.sendErrorResponse(
        res,
        ControllerError.ERROR_INVALID_API_RESPONSE,
        HttpErrorStatusCode.INTERNAL_ERROR
      )
    );
  }
  RestfulUtils.sendSuccessResponse(res, errorOrPaymentCheckResponse.value);
  return right(errorOrPaymentCheckResponse.value);
}

// Forward a payment check request from BackendApp to PagoPa
export async function activatePaymentToPagoPa(
  req: express.Request,
  res: express.Response,
  pagoPaConfig: PagoPaConfig
): Promise<Either<ControllerError, PaymentsActivationResponse>> {
  // Validate input
  const errorOrPaymentsActivationRequest = PaymentsActivationRequest.decode(
    req.params
  );
  if (errorOrPaymentsActivationRequest.isLeft()) {
    return left(
      RestfulUtils.sendErrorResponse(
        res,
        ControllerError.ERROR_INVALID_INPUT,
        HttpErrorStatusCode.BAD_REQUEST
      )
    );
  }

  // Convert controller request to PagoPa request
  const errorOrPaymentsActivationRequestPagoPa = PaymentsConverter.getPaymentsActivationRequestPagoPa(
    pagoPaConfig,
    errorOrPaymentsActivationRequest.value
  );
  if (errorOrPaymentsActivationRequestPagoPa.isLeft()) {
    return left(
      RestfulUtils.sendErrorResponse(
        res,
        ControllerError.ERROR_INVALID_INPUT,
        HttpErrorStatusCode.BAD_REQUEST
      )
    );
  }

  // Require payment activation to PagoPa API
  const errorOrPaymentActivationPagoPaResponse = await PaymentsService.sendPaymentsActivationRequestToPagoPaAPI(
    errorOrPaymentsActivationRequestPagoPa.value,
    pagoPaConfig
  );

  // Provide a response to applicant
  if (errorOrPaymentActivationPagoPaResponse.isLeft()) {
    RestfulUtils.sendUnavailableAPIError(res);
    return left(ControllerError.ERROR_API_UNAVAILABLE);
  }

  // Check if request was rejected
  if (
    errorOrPaymentActivationPagoPaResponse.value.nodoAttivaRPTRisposta.esito ===
    PPTPortTypes.Esito.KO
  ) {
    return left(
      RestfulUtils.sendErrorResponse(
        res,
        ControllerError.REQUEST_REJECTED,
        HttpErrorStatusCode.BAD_REQUEST
      )
    );
  }

  // Convert PagoPa response to controller response
  const errorOrPaymentActivationResponse = PaymentsConverter.getPaymentsActivationResponse(
    errorOrPaymentActivationPagoPaResponse.value
  );
  if (errorOrPaymentActivationResponse.isLeft()) {
    return left(
      RestfulUtils.sendErrorResponse(
        res,
        ControllerError.ERROR_INVALID_API_RESPONSE,
        HttpErrorStatusCode.INTERNAL_ERROR
      )
    );
  }
  RestfulUtils.sendSuccessResponse(res, errorOrPaymentActivationResponse.value);
  return right(errorOrPaymentActivationResponse.value);
}

// Receive a payment activation status update from PagoPa and store it into DB
export async function updatePaymentActivationStatusIntoDB(
  cdInfoWispInput: IcdInfoWispInput,
  statusTimeout: RedisTimeout,
  redisClient: redis.RedisClient
): Promise<IcdInfoWispOutput> {
  // Check DB connection status
  if (redisClient.connected !== true) {
    return {
      esito: PPTPortTypes.Esito.KO
    };
  }
  try {
    redisClient.set(
      cdInfoWispInput.codiceContestoPagamento,
      cdInfoWispInput.idPagamento,
      "EX",
      statusTimeout
    );
  } catch (exception) {
    return {
      esito: PPTPortTypes.Esito.KO
    };
  }
  return {
    esito: PPTPortTypes.Esito.OK
  };
}

// Check if a paymentId related to a codiceContestoPagamento is available and return it
export async function checkPaymentActivationStatusFromDB(
  req: express.Request,
  res: express.Response,
  redisClient: redis.RedisClient
): Promise<Either<ControllerError, PaymentsActivationStatusCheckResponse>> {
  // Validate input
  const errorOrCodiceContestoPagamento = CodiceContestoPagamento.decode(
    req.params.codiceContestoPagamento
  );
  if (errorOrCodiceContestoPagamento.isLeft()) {
    return left(
      RestfulUtils.sendErrorResponse(
        res,
        ControllerError.ERROR_INVALID_INPUT,
        HttpErrorStatusCode.BAD_REQUEST
      )
    );
  }

  // Check db connection status
  if (redisClient.connected !== true) {
    return left(
      RestfulUtils.sendErrorResponse(
        res,
        ControllerError.ERROR_INTERNAL,
        HttpErrorStatusCode.INTERNAL_ERROR
      )
    );
  }

  // Retrieve idPayment related to a codiceContestoPagamento from DB
  const getAsyncRedis = promisify(redisClient.get).bind(redisClient);
  const idPagamento = await getAsyncRedis(errorOrCodiceContestoPagamento.value);

  const errorOrPaymentsActivationStatusCheckResponse = PaymentsActivationStatusCheckResponse.decode(
    {
      codiceContestoPagamento: errorOrCodiceContestoPagamento.value,
      idPagamento
    }
  );

  if (errorOrPaymentsActivationStatusCheckResponse.isLeft()) {
    return left(
      RestfulUtils.sendErrorResponse(
        res,
        ControllerError.ERROR_DATA_NOT_FOUND,
        HttpErrorStatusCode.NOT_FOUND
      )
    );
  }
  RestfulUtils.sendSuccessResponse(
    res,
    errorOrPaymentsActivationStatusCheckResponse.value
  );
  return right(errorOrPaymentsActivationStatusCheckResponse.value);
}

// Generate a Session Token to follow a stream of requests
function generateCodiceContestoPagamento(): Either<
  Error,
  CodiceContestoPagamento
> {
  return CodiceContestoPagamento.decode(uuid.v1()).mapLeft(() => {
    return Error();
  });
}
