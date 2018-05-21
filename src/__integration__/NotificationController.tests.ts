/**
 * Notification Controller Tests (Avvisatura)
 * Test Notification Controllers sending HTTP requests and checking responses provided by PagoPa API Mocked Server
 */

// tslint:disable

import * as http from "http";
import fetch from "node-fetch";
import { App } from "../App";
import { CONFIG } from "../Configuration";
import { ControllerError } from "../enums/ControllerError";
import { MockedProxyAPIApp } from "../mocks/MockedProxyAPIApp";
import { disableConsoleLog } from "../utils/Logger";
import { FiscalCode } from "../types/FiscalCode";
import { RestfulUtils } from "../utils/RestfulUtils";

let mockedProxyAPIServer: http.Server;
let server: http.Server;

beforeAll(() => {
  disableConsoleLog();
  mockedProxyAPIServer = MockedProxyAPIApp.startApp();
  server = App.startApp();
});

afterAll(() => {
  App.stopServer(server);
  MockedProxyAPIApp.stopServer(mockedProxyAPIServer);
});

describe("Notification Controllers", () => {
  test("Activation should return a positive result", () => {
    FiscalCode.decode("AAABBB88H22A089A");
    return fetch(
      CONFIG.CONTROLLER.HOST +
        ":" +
        CONFIG.CONTROLLER.PORT +
        RestfulUtils.getActivateNotificationSubscriptionUrlForApp(
          FiscalCode.decode("AAABBB88H22A089A").value as FiscalCode
        ),
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
    return fetch(
      CONFIG.CONTROLLER.HOST +
        ":" +
        CONFIG.CONTROLLER.PORT +
        RestfulUtils.getActivateNotificationSubscriptionUrlForApp(
          FiscalCode.decode("BADBAD88H22A089A").value as FiscalCode
        ),
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
    return fetch(
      CONFIG.CONTROLLER.HOST +
        ":" +
        CONFIG.CONTROLLER.PORT +
        RestfulUtils.getActivateNotificationSubscriptionUrlForApp(
          FiscalCode.decode("wrongFiscalCode").value as FiscalCode
        ),
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
    return fetch(
      CONFIG.CONTROLLER.HOST +
        ":" +
        CONFIG.CONTROLLER.PORT +
        RestfulUtils.getActivateNotificationSubscriptionUrlForApp(
          FiscalCode.decode("AAABBB88H22A089A").value as FiscalCode
        ),
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
    return fetch(
      CONFIG.CONTROLLER.HOST +
        ":" +
        CONFIG.CONTROLLER.PORT +
        RestfulUtils.getDeactivateNotificationSubscriptionUrlForApp(
          FiscalCode.decode("BADBAD88H22A089A").value as FiscalCode
        ),
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
