/**
 * Login Controller Tests
 * Test Login Controllers sending HTTP requests and checking responses provided by PagoPa API Mocked Server
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

describe("Login Controllers", () => {
  test("Login should return a token", done => {
    fetch(
      CONFIG.CONTROLLER.HOST +
        ":" +
        CONFIG.CONTROLLER.PORT +
        CONFIG.CONTROLLER.ROUTES.LOGIN +
        "?username=mario&password=rossi"
    ).then(response => {
      response.json().then(jsonResp => {
        expect(response.status).toBe(200);
        expect(jsonResp.errorMessage).toBeUndefined();
        expect(jsonResp).toHaveProperty("token");
        expect(jsonResp.token.length).toBeGreaterThan(0);
        done();
      });
    });
  });

  test("Login should return a failed login message (wrong credentials)", done => {
    fetch(
      CONFIG.CONTROLLER.HOST +
        ":" +
        CONFIG.CONTROLLER.PORT +
        CONFIG.CONTROLLER.ROUTES.LOGIN +
        "?username=mario&password=wrong"
    ).then(response => {
      response.json().then(jsonResp => {
        expect(response.status).toBe(401);
        expect(jsonResp).toHaveProperty("errorMessage");
        expect(jsonResp.errorMessage).toBe("Login failed");
        expect(jsonResp.token).toBeUndefined();
        done();
      });
    });
  });

  test("Login should return a failed login message (missing inputs)", done => {
    fetch(
      CONFIG.CONTROLLER.HOST +
        ":" +
        CONFIG.CONTROLLER.PORT +
        CONFIG.CONTROLLER.ROUTES.LOGIN +
        "?username=mario"
    ).then(response => {
      response.json().then(jsonResp => {
        expect(response.status).toBe(400);
        expect(jsonResp).toHaveProperty("errorMessage");
        expect(jsonResp.errorMessage).toBe("Invalid input provided");
        expect(jsonResp.token).toBeUndefined();
        done();
      });
    });
  });

  test("LoginAnonymous should return a token", done => {
    fetch(
      CONFIG.CONTROLLER.HOST +
        ":" +
        CONFIG.CONTROLLER.PORT +
        CONFIG.CONTROLLER.ROUTES.LOGIN_ANONYMOUS +
        "?email=mario@mail.it&idPayment=test"
    ).then(response => {
      response.json().then(jsonResp => {
        expect(response.status).toBe(200);
        expect(jsonResp.errorMessage).toBeUndefined();
        expect(jsonResp).toHaveProperty("token");
        expect(jsonResp.token.length).toBeGreaterThan(0);
        done();
      });
    });
  });

  test("LoginAnonymous should return a failed login message (wrong idPayment)", done => {
    fetch(
      CONFIG.CONTROLLER.HOST +
        ":" +
        CONFIG.CONTROLLER.PORT +
        CONFIG.CONTROLLER.ROUTES.LOGIN_ANONYMOUS +
        "?email=mario@mail.it&idPayment=wrong"
    ).then(response => {
      response.json().then(jsonResp => {
        expect(response.status).toBe(401);
        expect(jsonResp).toHaveProperty("errorMessage");
        expect(jsonResp.errorMessage).toBe("Login failed");
        expect(jsonResp.token).toBeUndefined();
        done();
      });
    });
  });

  test("LoginAnonymous should return a failed login message (missing inputs)", done => {
    fetch(
      CONFIG.CONTROLLER.HOST +
        ":" +
        CONFIG.CONTROLLER.PORT +
        CONFIG.CONTROLLER.ROUTES.LOGIN_ANONYMOUS +
        "?email=mario@mail.it"
    ).then(response => {
      response.json().then(jsonResp => {
        expect(response.status).toBe(400);
        expect(jsonResp).toHaveProperty("errorMessage");
        expect(jsonResp.errorMessage).toBe("Invalid input provided");
        expect(jsonResp.token).toBeUndefined();
        done();
      });
    });
  });
});
