/**
 * Communication Errors Tests
 * Test errors due to communication error with PagoPaAPI
 */

// tslint:disable

import * as http from "http";
import fetch from "node-fetch";
import { App } from "../App";
import { CONFIG } from "../Configuration";
import { disableConsoleLog } from "../utils/Logger";
import { ControllerError } from "../enums/ControllerError";
import { FiscalCode } from "../types/FiscalCode";
import { RestfulUtils } from "../utils/RestfulUtils";

let server: http.Server;

beforeAll(() => {
  disableConsoleLog();
  server = App.startApp();
});

afterAll(() => {
  App.stopServer(server);
});

describe("Generic Controllers", () => {
  test("PagoPaAPI should be not available", done => {
    fetch(
      CONFIG.CONTROLLER.HOST +
        ":" +
        CONFIG.CONTROLLER.PORT +
        RestfulUtils.getActivateNotificationSubscriptionUrlForApp(
          FiscalCode.decode("AAABBB11H11A100A").value as FiscalCode
        ),
      {
        method: "POST"
      }
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
