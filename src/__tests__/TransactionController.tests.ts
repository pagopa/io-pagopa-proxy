/**
 * Transaction Controller Tests
 * Test Transaction Controllers sending HTTP requests and checking responses provided by PagoPa API Mocked Server
 */

// tslint:disable

import fetch from "node-fetch";
import { App } from "../App";
import { CONFIG } from "../Configuration";
import { StatusCode } from "../enums/StatusCode";
import { MockedProxyAPIApp } from "../mocks/MockedProxyAPIApp";

let mockedProxyAPIApp: MockedProxyAPIApp;
let app: App;

beforeAll(() => {
  console.log = () => undefined;
  console.error = () => undefined;
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
    )
      .then(fetchRes => fetchRes.json())
      .then(response => {
        expect(response).toHaveProperty("status");
        expect(response.status).toBe(StatusCode.OK);
        expect(response.errorMessage).toBeUndefined();
        expect(response).toHaveProperty("content");
        expect(response.content).toHaveProperty("total");
        expect(response.content).toHaveProperty("start");
        expect(response.content).toHaveProperty("size");
        expect(response.content).toHaveProperty("transactions");
        expect(response.content.transactions.length).toBeGreaterThan(1);
        done();
      });
  });

  test("Transaction List should return a failed message (missing token)", done => {
    fetch(
      CONFIG.CONTROLLER.HOST +
      ":" +
      CONFIG.CONTROLLER.PORT +
      CONFIG.CONTROLLER.ROUTES.TRANSACTIONS
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

  test("Transaction List should return a specific element", done => {
    fetch(
      (
        CONFIG.CONTROLLER.HOST +
        ":" +
        CONFIG.CONTROLLER.PORT +
        CONFIG.CONTROLLER.ROUTES.TRANSACTION
      ).replace(":id", "2") + "?token=A123"
    )
      .then(fetchRes => fetchRes.json())
      .then(response => {
        expect(response).toHaveProperty("status");
        expect(response.status).toBe(StatusCode.OK);
        expect(response.errorMessage).toBeUndefined();
        expect(response).toHaveProperty("content");
        expect(response.content).toHaveProperty("total");
        expect(response.content).toHaveProperty("start");
        expect(response.content).toHaveProperty("size");
        expect(response.content).toHaveProperty("transactions");
        expect(response.content.transactions.length).toBe(1);
        done();
      });
  });
});
