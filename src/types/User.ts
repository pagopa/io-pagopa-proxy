/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 *
 */

import * as express from "express";
import * as t from "io-ts";

import { Either } from "fp-ts/lib/Either";

import { NonEmptyString } from "italia-ts-commons/lib/strings";

export const User = t.interface({
  token: NonEmptyString
});

export type User = t.TypeOf<typeof User>;

export function extractUserFromRequest(
  req: express.Request
): Either<Error, User> {
  const result = User.decode({ token: req.query.token });
  return result.mapLeft(() => new Error("User not found"));
}
