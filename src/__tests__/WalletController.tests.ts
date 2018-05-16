/**
 * Wallet Controller Tests
 * Test Wallet Controllers sending HTTP requests and checking responses provided by PagoPa API Mocked Server
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

describe("Wallet Controllers", () => {
  test("Wallet should return more than one element", done => {
    fetch(
      CONFIG.CONTROLLER.HOST +
        ":" +
        CONFIG.CONTROLLER.PORT +
        CONFIG.CONTROLLER.ROUTES.WALLET +
        "?token=A123"
    ).then(response => {
      response.json().then(jsonResp => {
        expect(response.status).toBe(200);
        expect(jsonResp.errorMessage).toBeUndefined();
        expect(jsonResp).toHaveProperty("wallet");
        expect(jsonResp.wallet.length).toBeGreaterThan(1);
        done();
      });
    });
  });

  test("Wallet should return a failed message (missing token)", done => {
    fetch(
      CONFIG.CONTROLLER.HOST +
        ":" +
        CONFIG.CONTROLLER.PORT +
        CONFIG.CONTROLLER.ROUTES.WALLET
    ).then(response => {
      response.json().then(jsonResp => {
        expect(response.status).toBe(400);
        expect(jsonResp).toHaveProperty("errorMessage");
        expect(jsonResp.errorMessage).toBe(
          "Token is required for this request"
        );
        expect(jsonResp.wallet).toBeUndefined();
        done();
      });
    });
  });
});
