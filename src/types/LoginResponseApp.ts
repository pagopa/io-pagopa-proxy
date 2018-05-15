/**
 * Login Response Types
 * Define response interfaces used by controllers for Login services
 */

import * as t from "io-ts";

export const LoginResponseApp = t.interface({
  token: t.string
});
export type LoginResponseApp = t.TypeOf<typeof LoginResponseApp>;

export const LoginAnonymousResponseApp = t.interface({
  token: t.string,
  type: t.string,
  title: t.string,
  privacy: t.string,
  terms: t.string
});
export type LoginAnonymousResponseApp = t.TypeOf<
  typeof LoginAnonymousResponseApp
>;
