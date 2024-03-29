/**
 * Handler for publishing the API specs as JSON
 * See https://zalando.github.io/restful-api-guidelines/index.html#192
 */

import * as express from "express";
import { wrapRequestHandler } from "@pagopa/ts-commons/lib/request_middleware";
import { ResponseSuccessJson } from "@pagopa/ts-commons/lib/responses";

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions, @typescript-eslint/ban-types
export function GetOpenapi(apiSpecs: object): express.RequestHandler {
  return wrapRequestHandler(() =>
    Promise.resolve(ResponseSuccessJson(apiSpecs))
  );
}
