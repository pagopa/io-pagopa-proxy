/**
 * Wallet Controller Tests
 * Test Wallet Controllers sending HTTP requests and checking responses provided by PagoPa API Mocked Server
 */

// tslint:disable

import fetch from "node-fetch";
import { App } from "../App";
import { CONFIG } from "../Configuration";
import { StatusCode } from "../enums/StatusCode";
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
    )
      .then(fetchRes => fetchRes.json())
      .then(response => {
        expect(response).toHaveProperty("status");
        expect(response.status).toBe(StatusCode.OK);
        expect(response.errorMessage).toBeUndefined();
        expect(response).toHaveProperty("content");
        expect(response.content).toHaveProperty("wallet");
        expect(response.content.wallet.length).toBeGreaterThan(1);
        done();
      });
  });

  test("Wallet should return a failed message (missing token)", done => {
    fetch(
      CONFIG.CONTROLLER.HOST +
        ":" +
        CONFIG.CONTROLLER.PORT +
        CONFIG.CONTROLLER.ROUTES.WALLET
    )
      .then(fetchRes => fetchRes.json())
      .then(response => {
        expect(response).toHaveProperty("status");
        expect(response).toHaveProperty("errorMessage");
        expect(response.status).toBe(StatusCode.ERROR);
        expect(response.errorMessage).toBe(
          "Token is required for this request"
        );
        expect(response.content).toBeUndefined();
        done();
      });
  });
});
