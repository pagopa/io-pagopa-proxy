/**
 * Communication Errors Tests
 * Test errors due to communication error with PagoPaAPI
 */

import * as http from "http";
import fetch from "node-fetch";
import * as App from "../App";
import * as Configuration from "../Configuration";
import { FiscalCode } from "../types/FiscalCode";
import { disableConsoleLog } from "../utils/Logger";
import * as RestfulUtils from "../utils/RestfulUtils";

let server: http.Server; // tslint:disable-line

const config = Configuration.GET_CONFIG();
beforeAll(() => {
  disableConsoleLog();
  server = App.startApp();
});

afterAll(() => {
  App.stopServer(server);
});

describe("Generic Controllers", () => {
  test("PagoPaAPI should be not available", () => {
    const serviceEndpoint = RestfulUtils.getNotificationSubscriptionUrlForCtrl(
      FiscalCode.decode("AAABBB11H11A100A").value as FiscalCode, // tslint:disable-line
      config.CONTROLLER.ROUTES.NOTIFICATION_ACTIVATION
    );
    return fetch(
      `${config.CONTROLLER.HOST}:${config.CONTROLLER.PORT}${serviceEndpoint}`,
      {
        method: "POST"
      }
    ).then(response => {
      expect(response.status).toBe(503);
    });
  });
});
