/**
 * Login Response Types
 * Define response interfaces used by controllers for Login services
 */

import { NonEmptyString } from "italia-ts-commons/lib/strings";
import { IRestfulObject } from "./BaseResponseApp";

export interface ILoginResponseApp extends IRestfulObject {
  readonly token: string;
}

export interface ILoginAnonymousResponseApp extends IRestfulObject {
  readonly token: NonEmptyString;
  readonly type: string;
  readonly title: string;
  readonly privacy: string;
  readonly terms: string;
}
