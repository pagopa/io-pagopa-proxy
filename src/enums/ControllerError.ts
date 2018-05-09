/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 */

export enum ControllerError {
  ERROR_INVALID_INPUT = "Invalid input provided",
  ERROR_INVALID_TOKEN = "Token is required for this request",
  ERROR_LOGIN_FAILED = "Login failed",
  ERROR_PAGOPA_API_UNAVAILABLE = "Service PagoPa is currently unavailable",
  ERROR_DATA_NOT_FOUND = "Requested data was not found or Invalid request"
}
