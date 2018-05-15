/**
 * UserAPI Services
 * Provide services related to User (Login) to communicate with PagoPaAPI
 */

import * as express from "express";
import fetch from "node-fetch";
import querystring = require("querystring");
import { CONFIG } from "../../Configuration";
import { LoginAnonymousResponse, LoginResponse } from "../types/LoginResponse";

// User Service for PagoPA communications
export class UserAPI {
  // Login existing user with username and password
  public static login(
    res: express.Response,
    errorCallback: (res: express.Response, errorMsg: string) => void,
    successCallback: (
      res: express.Response,
      loginResponse: LoginResponse
    ) => void,
    username: string,
    password: string
  ): void {
    const url =
      CONFIG.PAGOPA.HOST +
      ":" +
      String(CONFIG.PAGOPA.PORT) +
      CONFIG.PAGOPA.SERVICES.LOGIN;
    const queryParams = querystring.stringify({
      username,
      password
    });
    fetch(url + "?" + queryParams, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    })
      .then(fetchRes => fetchRes.json())
      .then(json => successCallback(res, json))
      .catch(err => errorCallback(res, err));
  }

  // Start a user session for unregistered users
  public static loginAnonymous(
    res: express.Response,
    errorCallback: (res: express.Response, errorMsg: string) => void,
    successCallback: (
      res: express.Response,
      loginAnonymousResponse: LoginAnonymousResponse
    ) => void,
    email: string,
    idPayment: string
  ): void {
    const url =
      CONFIG.PAGOPA.HOST +
      ":" +
      String(CONFIG.PAGOPA.PORT) +
      CONFIG.PAGOPA.SERVICES.LOGIN_ANONYMOUS;
    const queryParams = querystring.stringify({
      email,
      idPayment
    });

    fetch(url + "?" + queryParams, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    })
      .then(fetchRes => fetchRes.json())
      .then(json => successCallback(res, json))
      .catch(err => errorCallback(res, err));
  }
}
