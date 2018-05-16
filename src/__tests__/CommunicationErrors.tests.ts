/**
 * Communication Errors Tests
 * Test errors due to communication error with PagoPaAPI
 */

// tslint:disable

import fetch from "node-fetch";
import { App } from "../App";
import { CONFIG } from "../Configuration";
import { disableConsoleLog } from "../utils/Logger";
import { ControllerError } from "../enums/ControllerError";

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
    ).then(response => {
      response.json().then(jsonResp => {
        expect(response.status).toBe(503);
        expect(jsonResp).toHaveProperty("errorMessage");
        expect(jsonResp.errorMessage).toBe(
          ControllerError.ERROR_PAGOPA_API_UNAVAILABLE
        );
        done();
      });
    });
  });
});
