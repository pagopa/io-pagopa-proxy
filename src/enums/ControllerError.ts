/**
 * ControllerError Enumerator
 * Define errors returned by controllers
 */

export enum ControllerError {
  ERROR_INVALID_INPUT = "Invalid input provided",
  ERROR_INVALID_TOKEN = "Token is required for this request",
  ERROR_API_UNAVAILABLE = "Service API is currently unavailable",
  ERROR_DATA_NOT_FOUND = "Requested data was not found or Invalid request",
  REQUEST_REJECTED = "Request was rejected",
  ERROR_INVALID_API_RESPONSE = "Invalid response retrieved from API",
  ERROR_INTERNAL = "Internal error"
}
