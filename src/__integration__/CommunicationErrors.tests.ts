/**
 * Communication Errors Tests
 * Test errors due to communication error with PagoPaAPI
 */

import * as http from "http";
import fetch from "node-fetch";
import * as App from "../App";
import { CONFIG, Configuration } from "../Configuration";
import { disableConsoleLog } from "../utils/Logger";

let server: http.Server; // tslint:disable-line
const config = Configuration.decode(CONFIG).value as Configuration; // tslint:disable-line

beforeAll(() => {
  disableConsoleLog();
  server = App.startApp();
});

afterAll(() => {
  App.stopServer(server);
});

describe("Generic Controllers", () => {
  test("PagoPaAPI should be not available", async () => {
    const response = await fetch(
      `${config.CONTROLLER.HOST}:${config.CONTROLLER.PORT}${
        config.CONTROLLER.ROUTES.PAYMENTS_CHECK
      }`,
      {
        method: "GET"
      }
    );
    expect(response.status).toBe(503);
  });
});
