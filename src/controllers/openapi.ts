/**
 * Handler for publishing the API specs as JSON
 * See https://zalando.github.io/restful-api-guidelines/index.html#192
 */

import * as express from "express";
import { ResponseSuccessJson } from "italia-ts-commons/lib/responses";
import { wrapRequestHandler } from "../utils/RequestMiddleware";

export function GetOpenapi(apiSpecs: object): express.RequestHandler {
  return wrapRequestHandler(() =>
    Promise.resolve(ResponseSuccessJson(apiSpecs))
  );
}
