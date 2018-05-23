/**
 * Notification Controller Tests (Avvisatura)
 * Test Notification Controllers sending HTTP requests and checking responses provided by PagoPa API Mocked Server
 */

// tslint:disable:no-identical-functions

import * as http from "http";
import fetch from "node-fetch";
import * as App from "../App";
import { CONFIG, Configuration } from "../Configuration";
import { ControllerError } from "../enums/ControllerError";
import * as MockedProxyAPIApp from "../mocks/MockedProxyAPIApp";
import { FiscalCode } from "../types/FiscalCode";
import * as Logger from "../utils/Logger";
import * as RestfulUtils from "../utils/RestfulUtils";

let mockedProxyAPIServer: http.Server; // tslint:disable-line
let server: http.Server; // tslint:disable-line
const config = Configuration.decode(CONFIG).value as Configuration; // tslint:disable-line
const validFiscalCode: FiscalCode = FiscalCode.decode("AAABBB88H22A089A")
  .value as FiscalCode; // tslint:disable-line
const validButRefusedFiscalCode: FiscalCode = FiscalCode.decode(
  "BADBAD88H22A089A"
).value as FiscalCode; // tslint:disable-line

beforeAll(() => {
  Logger.disableConsoleLog();
  mockedProxyAPIServer = MockedProxyAPIApp.startApp();
  server = App.startApp();
});

afterAll(() => {
  App.stopServer(server);
  MockedProxyAPIApp.stopServer(mockedProxyAPIServer);
});

describe("Notification Controllers", async () => {
  test("Activation should return a positive result", async () => {
    const serviceEndpoint = RestfulUtils.getNotificationSubscriptionUrlForCtrl(
      validFiscalCode,
      config.CONTROLLER.ROUTES.NOTIFICATION_ACTIVATION
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
  const serviceEndpoint = RestfulUtils.getNotificationSubscriptionUrlForCtrl(
    validButRefusedFiscalCode,
    config.CONTROLLER.ROUTES.NOTIFICATION_ACTIVATION
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
  const serviceEndpoint = config.CONTROLLER.ROUTES.NOTIFICATION_ACTIVATION.replace(
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
  const serviceEndpoint = RestfulUtils.getNotificationSubscriptionUrlForCtrl(
    validFiscalCode,
    config.CONTROLLER.ROUTES.NOTIFICATION_DEACTIVATION
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
  const serviceEndpoint = RestfulUtils.getNotificationSubscriptionUrlForCtrl(
    validButRefusedFiscalCode,
    config.CONTROLLER.ROUTES.NOTIFICATION_DEACTIVATION
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
