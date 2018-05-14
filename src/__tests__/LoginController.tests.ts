/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
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

describe("Login Controllers", () => {
  test("Login should return a token", done => {
    fetch(
      CONFIG.CONTROLLER.HOST +
        ":" +
        CONFIG.CONTROLLER.PORT +
        CONFIG.CONTROLLER.ROUTES.LOGIN +
        "?username=mario&password=rossi"
    )
      .then(fetchRes => fetchRes.json())
      .then(response => {
        expect(response).toHaveProperty("status");
        expect(response.status).toBe(StatusCode.OK);
        expect(response.errorMessage).toBeUndefined();
        expect(response).toHaveProperty("content");
        expect(response.content).toHaveProperty("token");
        expect(response.content.token.length).toBeGreaterThan(0);
        done();
      });
  });

  test("Login should return a failed login message (wrong credentials)", done => {
    fetch(
      CONFIG.CONTROLLER.HOST +
        ":" +
        CONFIG.CONTROLLER.PORT +
        CONFIG.CONTROLLER.ROUTES.LOGIN +
        "?username=mario&password=wrong"
    )
      .then(fetchRes => fetchRes.json())
      .then(response => {
        expect(response).toHaveProperty("status");
        expect(response).toHaveProperty("errorMessage");
        expect(response.status).toBe(StatusCode.ERROR);
        expect(response.errorMessage).toBe("Login failed");
        expect(response.content).toBeUndefined();
        done();
      });
  });

  test("Login should return a failed login message (missing inputs)", done => {
    fetch(
      CONFIG.CONTROLLER.HOST +
        ":" +
        CONFIG.CONTROLLER.PORT +
        CONFIG.CONTROLLER.ROUTES.LOGIN +
        "?username=mario"
    )
      .then(fetchRes => fetchRes.json())
      .then(response => {
        expect(response).toHaveProperty("status");
        expect(response).toHaveProperty("errorMessage");
        expect(response.status).toBe(StatusCode.ERROR);
        expect(response.errorMessage).toBe("Invalid input provided");
        expect(response.content).toBeUndefined();
        done();
      });
  });

  test("LoginAnonymous should return a token", done => {
    fetch(
      CONFIG.CONTROLLER.HOST +
        ":" +
        CONFIG.CONTROLLER.PORT +
        CONFIG.CONTROLLER.ROUTES.LOGIN_ANONYMOUS +
        "?email=mario@mail.it&idPayment=test"
    )
      .then(fetchRes => fetchRes.json())
      .then(response => {
        expect(response).toHaveProperty("status");
        expect(response.status).toBe(StatusCode.OK);
        expect(response.errorMessage).toBeUndefined();
        expect(response).toHaveProperty("content");
        expect(response.content).toHaveProperty("token");
        expect(response.content.token.length).toBeGreaterThan(0);
        done();
      });
  });

  test("LoginAnonymous should return a failed login message (wrong idPayment)", done => {
    fetch(
      CONFIG.CONTROLLER.HOST +
        ":" +
        CONFIG.CONTROLLER.PORT +
        CONFIG.CONTROLLER.ROUTES.LOGIN_ANONYMOUS +
        "?email=mario@mail.it&idPayment=wrong"
    )
      .then(fetchRes => fetchRes.json())
      .then(response => {
        expect(response).toHaveProperty("status");
        expect(response).toHaveProperty("errorMessage");
        expect(response.status).toBe(StatusCode.ERROR);
        expect(response.errorMessage).toBe("Login failed");
        expect(response.content).toBeUndefined();
        done();
      });
  });

  test("LoginAnonymous should return a failed login message (missing inputs)", done => {
    fetch(
      CONFIG.CONTROLLER.HOST +
        ":" +
        CONFIG.CONTROLLER.PORT +
        CONFIG.CONTROLLER.ROUTES.LOGIN_ANONYMOUS +
        "?email=mario@mail.it"
    )
      .then(fetchRes => fetchRes.json())
      .then(response => {
        expect(response).toHaveProperty("status");
        expect(response).toHaveProperty("errorMessage");
        expect(response.status).toBe(StatusCode.ERROR);
        expect(response.errorMessage).toBe("Invalid input provided");
        expect(response.content).toBeUndefined();
        done();
      });
  });
});
