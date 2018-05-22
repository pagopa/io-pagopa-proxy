/**
 * Notification Controller Tests (Avvisatura)
 * Test Notification Controllers sending HTTP requests and checking responses provided by PagoPa API Mocked Server
 */

// tslint:disable

import * as http from "http";
import fetch from "node-fetch";
import * as App from "../App";
import { ControllerError } from "../enums/ControllerError";
import * as MockedProxyAPIApp from "../mocks/MockedProxyAPIApp";
import * as Logger from "../utils/Logger";
import * as RestfulUtils from "../utils/RestfulUtils";
import { FiscalCode } from "../types/FiscalCode";
import * as Configuration from "../Configuration";
let mockedProxyAPIServer: http.Server;
let server: http.Server;

const config = Configuration.GET_CONFIG();
beforeAll(() => {
  Logger.disableConsoleLog();
  mockedProxyAPIServer = MockedProxyAPIApp.startApp();
  server = App.startApp();
});

afterAll(() => {
  App.stopServer(server);
  MockedProxyAPIApp.stopServer(mockedProxyAPIServer);
});

describe("Notification Controllers", () => {
  test("Activation should return a positive result", () => {
    const serviceEndpoint = RestfulUtils.getActivateNotificationSubscriptionUrlForApp(
      FiscalCode.decode("AAABBB88H22A089A").value as FiscalCode,
      config.CONTROLLER.ROUTES.NOTIFICATION_ACTIVATION
    );
    FiscalCode.decode("AAABBB88H22A089A");
    return fetch(
      `${config.CONTROLLER.HOST}:${config.CONTROLLER.PORT}${serviceEndpoint}`,
      {
        method: "POST"
      }
    ).then(response => {
      response.json().then(jsonResp => {
        expect(response.status).toBe(200);
        expect(jsonResp.errorMessage).toBeUndefined();
        expect(jsonResp).toHaveProperty("result");
        expect(jsonResp.result).toBe(true);
      });
    });
  });

  test("Activation should return a negative result", () => {
    const serviceEndpoint = RestfulUtils.getActivateNotificationSubscriptionUrlForApp(
      FiscalCode.decode("BADBAD88H22A089A").value as FiscalCode,
      config.CONTROLLER.ROUTES.NOTIFICATION_ACTIVATION
    );
    return fetch(
      `${config.CONTROLLER.HOST}:${config.CONTROLLER.PORT}${serviceEndpoint}`,
      {
        method: "POST"
      }
    ).then(response => {
      response.json().then(jsonResp => {
        expect(response.status).toBe(403);
        expect(jsonResp.errorMessage).toBe(ControllerError.REQUEST_REJECTED);
        expect(jsonResp.result).toBeUndefined();
      });
    });
  });

  test("Activation should return a negative result (invalid FiscalCode)", () => {
    const serviceEndpoint = RestfulUtils.getActivateNotificationSubscriptionUrlForApp(
      FiscalCode.decode("wrongFiscalCode").value as FiscalCode,
      config.CONTROLLER.ROUTES.NOTIFICATION_ACTIVATION
    );
    return fetch(
      `${config.CONTROLLER.HOST}:${config.CONTROLLER.PORT}${serviceEndpoint}`,
      {
        method: "POST"
      }
    ).then(response => {
      response.json().then(jsonResp => {
        expect(response.status).toBe(400);
        expect(jsonResp.errorMessage).toBe(ControllerError.ERROR_INVALID_INPUT);
        expect(jsonResp.result).toBeUndefined();
      });
    });
  });

  test("Deactivation should return a positive result", () => {
    const serviceEndpoint = RestfulUtils.getDeactivateNotificationSubscriptionUrlForApp(
      FiscalCode.decode("AAABBB88H22A089A").value as FiscalCode,
      config.CONTROLLER.ROUTES.NOTIFICATION_DEACTIVATION
    );
    return fetch(
      `${config.CONTROLLER.HOST}:${config.CONTROLLER.PORT}${serviceEndpoint}`,
      {
        method: "POST"
      }
    ).then(response => {
      return response.json().then(jsonResp => {
        expect(response.status).toBe(200);
        expect(jsonResp.errorMessage).toBeUndefined();
        expect(jsonResp).toHaveProperty("result");
        expect(jsonResp.result).toBe(true);
      });
    });
  });

  test("Deactivation should return a negative result", () => {
    const serviceEndpoint = RestfulUtils.getDeactivateNotificationSubscriptionUrlForApp(
      FiscalCode.decode("BADBAD88H22A089A").value as FiscalCode,
      config.CONTROLLER.ROUTES.NOTIFICATION_DEACTIVATION
    );
    return fetch(
      `${config.CONTROLLER.HOST}:${config.CONTROLLER.PORT}${serviceEndpoint}`,
      {
        method: "POST"
      }
    ).then(response => {
      response.json().then(jsonResp => {
        expect(response.status).toBe(403);
        expect(jsonResp.errorMessage).toBe(ControllerError.REQUEST_REJECTED);
        expect(jsonResp.result).toBeUndefined();
      });
    });
  });
});
