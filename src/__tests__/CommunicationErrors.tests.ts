/**
 * Communication Errors Tests
 * Test errors due to communication error with PagoPaAPI
 */

// tslint:disable

import fetch from "node-fetch";
import { App } from "../App";
import { CONFIG } from "../Configuration";
import { StatusCode } from "../enums/StatusCode";
import { ControllerError } from "../enums/ControllerError";
import { disableConsoleLog } from "../utils/Logger";

let app: App;

beforeAll(() => {
  disableConsoleLog();
  app = new App();
  app.startServer();
});

afterAll(() => {
  if (app !== undefined) app.stopServer();
});

describe("Generic Controllers", () => {
  test("PagoPaAPI should be not available", done => {
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
        expect(response.status).toBe(StatusCode.ERROR);
        expect(response.errorMessage).toBe(
          ControllerError.ERROR_PAGOPA_API_UNAVAILABLE
        );
        done();
      });
  });
});
