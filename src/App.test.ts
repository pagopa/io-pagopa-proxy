/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 *
 *
 */

import * as express from "express";
import * as http from "http";
import * as request from "request";

import App from "./App";

const WS_URL = "http://localhost:3000";
let server: http.Server; // tslint:disable-line
let app: express.Application; // tslint:disable-line

beforeAll(() =>
{
    app = new App(true).express;
    app.set("port", 3000);
    server = http.createServer(app);
    server.listen(3000);
});

describe("App", () =>
{
    test("should get welcome JSON", (done) =>
    {
        request(WS_URL + "/", (error, response, body) =>
        {
            expect(response).toBeTruthy();
            expect(response.statusCode).toBe(200);
            expect(error).toBe(null); // tslint:disable-line
            expect(response.headers["content-type"]).toContain("json");
            expect(body).toBe(
                "{\"message\":\"Welcome to AwesomePAPI!\",\"version\":\"0.0.10\"}"
            );
            done();
        });
    });
});

afterAll(() =>
{
    server.close();
});
