/**
 * Communication Errors Tests
 * Test errors due to communication error with PagoPaAPI
 */

// tslint:disable

import * as http from "http";
import fetch from "node-fetch";
import * as App from "../App";
import * as Configuration from "../Configuration";
import { disableConsoleLog } from "../utils/Logger";
import { ControllerError } from "../enums/ControllerError";
import { FiscalCode } from "../types/FiscalCode";
import * as RestfulUtils from "../utils/RestfulUtils";

let server: http.Server;

const config = Configuration.GET_CONFIG();
beforeAll(() => {
  disableConsoleLog();
  server = App.startApp();
});

afterAll(() => {
  App.stopServer(server);
});

describe("Generic Controllers", () => {
  test("PagoPaAPI should be not available", done => {
    const serviceEndpoint = RestfulUtils.getActivateNotificationSubscriptionUrlForApp(
      FiscalCode.decode("AAABBB11H11A100A").value as FiscalCode,
      config.CONTROLLER.ROUTES.NOTIFICATION_ACTIVATION
    );
    fetch(
      `${config.CONTROLLER.HOST}:${config.CONTROLLER.PORT}${serviceEndpoint}`,
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
