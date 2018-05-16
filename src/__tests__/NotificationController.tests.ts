/**
 * Notification Controller Tests (Avvisatura)
 * Test Notification Controllers sending HTTP requests and checking responses provided by PagoPa API Mocked Server
 */

// tslint:disable

import fetch from "node-fetch";
import { App } from "../App";
import { CONFIG } from "../Configuration";
import { ControllerError } from "../enums/ControllerError";
import { MockedProxyAPIApp } from "../mocks/MockedProxyAPIApp";
import { disableConsoleLog } from "../utils/Logger";

let mockedProxyAPIApp: MockedProxyAPIApp;
let app: App;

beforeAll(() => {
  disableConsoleLog();
  mockedProxyAPIApp = new MockedProxyAPIApp();
  app = new App();
  mockedProxyAPIApp.startServer();
  app.startServer();
});

afterAll(() => {
  if (app !== undefined) app.stopServer();
  if (mockedProxyAPIApp !== undefined) mockedProxyAPIApp.stopServer();
});

describe("Notification Controllers", () => {
  test("Activation should return a positive result", done => {
    fetch(
      (
        CONFIG.CONTROLLER.HOST +
        ":" +
        CONFIG.CONTROLLER.PORT +
        CONFIG.CONTROLLER.ROUTES.NOTIFICATION_ACTIVATION
      ).replace(":fiscalCode", "AAABBB11H11A100A"),
      {
        method: "POST"
      }
    ).then(response => {
      response.json().then(jsonResp => {
        expect(response.status).toBe(200);
        expect(jsonResp.errorMessage).toBeUndefined();
        expect(jsonResp).toHaveProperty("result");
        expect(jsonResp.result).toBe(true);
        done();
      });
    });
  });

  test("Activation should return a negative result", done => {
    fetch(
      (
        CONFIG.CONTROLLER.HOST +
        ":" +
        CONFIG.CONTROLLER.PORT +
        CONFIG.CONTROLLER.ROUTES.NOTIFICATION_ACTIVATION
      ).replace(":fiscalCode", "wrongFiscalCode"),
      {
        method: "POST"
      }
    ).then(response => {
      response.json().then(jsonResp => {
        expect(response.status).toBe(403);
        expect(jsonResp.errorMessage).toBe(ControllerError.REQUEST_REJECTED);
        expect(jsonResp.result).toBeUndefined();
        done();
      });
    });
  });
});

test("Deactivation should return a positive result", done => {
  fetch(
    (
      CONFIG.CONTROLLER.HOST +
      ":" +
      CONFIG.CONTROLLER.PORT +
      CONFIG.CONTROLLER.ROUTES.NOTIFICATION_DEACTIVATION
    ).replace(":fiscalCode", "AAABBB11H11A100A"),
    {
      method: "POST"
    }
  ).then(response => {
    response.json().then(jsonResp => {
      expect(response.status).toBe(200);
      expect(jsonResp.errorMessage).toBeUndefined();
      expect(jsonResp).toHaveProperty("result");
      expect(jsonResp.result).toBe(true);
      done();
    });
  });
});

describe("Notification Controllers", () => {
  test("Deactivation should return a negative result", done => {
    fetch(
      (
        CONFIG.CONTROLLER.HOST +
        ":" +
        CONFIG.CONTROLLER.PORT +
        CONFIG.CONTROLLER.ROUTES.NOTIFICATION_DEACTIVATION
      ).replace(":fiscalCode", "wrongFiscalCode"),
      {
        method: "POST"
      }
    ).then(response => {
      response.json().then(jsonResp => {
        expect(response.status).toBe(403);
        expect(jsonResp.errorMessage).toBe(ControllerError.REQUEST_REJECTED);
        expect(jsonResp.result).toBeUndefined();
        done();
      });
    });
  });
});
