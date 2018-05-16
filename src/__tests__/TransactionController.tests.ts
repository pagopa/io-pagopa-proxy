/**
 * Transaction Controller Tests
 * Test Transaction Controllers sending HTTP requests and checking responses provided by PagoPa API Mocked Server
 */

// tslint:disable

import fetch from "node-fetch";
import { App } from "../App";
import { CONFIG } from "../Configuration";
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

describe("Transaction Controllers", () => {
  test("Transaction List should return more than one element", done => {
    fetch(
      CONFIG.CONTROLLER.HOST +
        ":" +
        CONFIG.CONTROLLER.PORT +
        CONFIG.CONTROLLER.ROUTES.TRANSACTIONS +
        "?token=A123"
    ).then(response => {
      response.json().then(jsonResp => {
        expect(response.status).toBe(200);
        expect(jsonResp.errorMessage).toBeUndefined();
        expect(jsonResp).toHaveProperty("total");
        expect(jsonResp).toHaveProperty("start");
        expect(jsonResp).toHaveProperty("size");
        expect(jsonResp).toHaveProperty("transactions");
        expect(jsonResp.transactions.length).toBeGreaterThan(1);
        done();
      });
    });
  });

  test("Transaction List should return a failed message (missing token)", done => {
    fetch(
      CONFIG.CONTROLLER.HOST +
        ":" +
        CONFIG.CONTROLLER.PORT +
        CONFIG.CONTROLLER.ROUTES.TRANSACTIONS
    ).then(response => {
      response.json().then(jsonResp => {
        expect(response.status).toBe(400);
        expect(jsonResp).toHaveProperty("errorMessage");
        expect(jsonResp.errorMessage).toBe(
          "Token is required for this request"
        );
        expect(jsonResp.transactions).toBeUndefined();
        done();
      });
    });
  });

  test("Transaction List should return a specific element", done => {
    fetch(
      (
        CONFIG.CONTROLLER.HOST +
        ":" +
        CONFIG.CONTROLLER.PORT +
        CONFIG.CONTROLLER.ROUTES.TRANSACTION
      ).replace(":id", "2") + "?token=A123"
    ).then(response => {
      response.json().then(jsonResp => {
        expect(response.status).toBe(200);
        expect(jsonResp.errorMessage).toBeUndefined();
        expect(jsonResp).toHaveProperty("total");
        expect(jsonResp).toHaveProperty("start");
        expect(jsonResp).toHaveProperty("size");
        expect(jsonResp).toHaveProperty("transactions");
        expect(jsonResp.transactions.length).toBe(1);
        done();
      });
    });
  });
});
