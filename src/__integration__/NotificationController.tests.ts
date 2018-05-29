/**
 * Notification Controller Tests (Avvisatura)
 * Test Notification Controllers sending HTTP requests and checking responses provided by PagoPa API Mocked Server
 */

// tslint:disable:no-identical-functions

import { Either, Left, Right } from "fp-ts/lib/Either";
import * as http from "http";
import { NonEmptyString } from "italia-ts-commons/lib/strings";
import fetch from "node-fetch";
import * as App from "../App";
import { CONFIG, Configuration } from "../Configuration";
import { ControllerError } from "../enums/ControllerError";
import { FiscalCode } from "../types/CommonTypes";
import * as Logger from "../utils/Logger";

let server: http.Server; // tslint:disable-line
const config = Configuration.decode(CONFIG).value as Configuration; // tslint:disable-line
const validFiscalCode: FiscalCode = FiscalCode.decode("AAABBB88H22A089A")
  .value as FiscalCode; // tslint:disable-line
const validButRefusedFiscalCode: FiscalCode = FiscalCode.decode(
  "BADBAD88H22A089A"
).value as FiscalCode; // tslint:disable-line

beforeAll(() => {
  Logger.disableConsoleLog();
  server = App.startApp();
});

afterAll(() => {
  App.stopServer(server);
});

describe("Notification Controllers", async () => {
  test("Activation should return a positive result", async () => {
    const serviceEndpoint = getNotificationSubscriptionUrlForCtrl(
      validFiscalCode,
      config.CONTROLLER.ROUTES.NOTIFICATIONS_ACTIVATION
    );
    if (serviceEndpoint.isLeft()) {
      fail();
    }

    const response = await fetch(
      `${config.CONTROLLER.HOST}:${config.CONTROLLER.PORT}${
        serviceEndpoint.value
      }`,
      {
        method: "POST"
      }
    );
    const jsonResp = await response.json();

    expect(response.status).toBe(200);
    expect(jsonResp.errorMessage).toBeUndefined();
    expect(jsonResp).toHaveProperty("result");
    expect(jsonResp.result).toBe(true);
  });
});

test("Activation should return a negative result", async () => {
  const serviceEndpoint = getNotificationSubscriptionUrlForCtrl(
    validButRefusedFiscalCode,
    config.CONTROLLER.ROUTES.NOTIFICATIONS_ACTIVATION
  );
  if (serviceEndpoint.isLeft()) {
    fail();
  }
  const response = await fetch(
    `${config.CONTROLLER.HOST}:${config.CONTROLLER.PORT}${
      serviceEndpoint.value
    }`,
    {
      method: "POST"
    }
  );
  const jsonResp = await response.json();
  expect(response.status).toBe(403);
  expect(jsonResp.errorMessage).toBe(ControllerError.REQUEST_REJECTED);
  expect(jsonResp.result).toBeUndefined();
});

test("Activation should return a negative result (invalid FiscalCode)", async () => {
  const serviceEndpoint = config.CONTROLLER.ROUTES.NOTIFICATIONS_ACTIVATION.replace(
    ":fiscalCode",
    "wrongFiscalCode"
  );

  const response = await fetch(
    `${config.CONTROLLER.HOST}:${config.CONTROLLER.PORT}${serviceEndpoint}`,
    {
      method: "POST"
    }
  );
  const jsonResp = await response.json();

  expect(response.status).toBe(400);
  expect(jsonResp.errorMessage).toBe(ControllerError.ERROR_INVALID_INPUT);
  expect(jsonResp.result).toBeUndefined();
});

test("Deactivation should return a positive result", async () => {
  const serviceEndpoint = getNotificationSubscriptionUrlForCtrl(
    validFiscalCode,
    config.CONTROLLER.ROUTES.NOTIFICATIONS_DEACTIVATION
  );
  if (serviceEndpoint.isLeft()) {
    fail();
  }

  const response = await fetch(
    `${config.CONTROLLER.HOST}:${config.CONTROLLER.PORT}${
      serviceEndpoint.value
    }`,
    {
      method: "POST"
    }
  );
  const jsonResp = await response.json();

  expect(response.status).toBe(200);
  expect(jsonResp.errorMessage).toBeUndefined();
  expect(jsonResp).toHaveProperty("result");
  expect(jsonResp.result).toBe(true);
});

test("Deactivation should return a negative result", async () => {
  const serviceEndpoint = getNotificationSubscriptionUrlForCtrl(
    validButRefusedFiscalCode,
    config.CONTROLLER.ROUTES.NOTIFICATIONS_DEACTIVATION
  );
  if (serviceEndpoint.isLeft()) {
    fail();
  }

  const response = await fetch(
    `${config.CONTROLLER.HOST}:${config.CONTROLLER.PORT}${
      serviceEndpoint.value
    }`,
    {
      method: "POST"
    }
  );
  const jsonResp = await response.json();

  expect(response.status).toBe(403);
  expect(jsonResp.errorMessage).toBe(ControllerError.REQUEST_REJECTED);
  expect(jsonResp.result).toBeUndefined();
});

// Provide a valid url to activate\deactivate notification subscription
export function getNotificationSubscriptionUrlForCtrl(
  fiscalCode: FiscalCode,
  serviceUrl: NonEmptyString
): Either<Error, NonEmptyString> {
  const errorOrUrl = NonEmptyString.decode(
    serviceUrl.replace(":fiscalCode", fiscalCode)
  );

  if (errorOrUrl.isLeft()) {
    return new Left(
      new Error("Invalid Url for Notification Subscription Controller")
    );
  }
  return new Right(errorOrUrl.value);
}
