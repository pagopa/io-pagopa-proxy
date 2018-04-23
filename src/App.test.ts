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
import { ICreditCard } from "./types/CreditCard";
import { PaymentMethodType } from "./types/PaymentMethod";

const WS_URL = "http://localhost:3000";
let server: http.Server; // tslint:disable-line
let app: express.Application; // tslint:disable-line

beforeAll(() => {
    app = new App(true).express;
    app.set("port", 3000);
    server = http.createServer(app);
    server.listen(3000);
});

describe("App", () => {
    const contentTypeHeader = "content-type";

    test("should get welcome JSON", done => {
        request(WS_URL + "/", (error, response, body) => {
            expect(response).toBeTruthy();
            expect(response.statusCode).toBe(200);
            expect(error).toBe(null); // tslint:disable-line
            expect(response.headers[contentTypeHeader]).toContain("json");
            expect(JSON.parse(body)).toEqual({
                message: "Welcome to AwesomePAPI!",
                version: "0.0.11"
            });
            done();
        });
    });

    test("should return a wallet", done => {
        request(WS_URL + "/wallet", (error, response, body) => {
            expect(response).toBeTruthy();
            expect(response.statusCode).toBe(200);
            expect(error).toBeNull();
            expect(response.headers[contentTypeHeader]).toContain("json");

            const obj = JSON.parse(body);
            const walletProperty = "wallet";

            expect(obj).toHaveProperty("status", "OK");
            expect(obj).toHaveProperty(walletProperty);
            expect(obj[walletProperty].length).toBeGreaterThan(1);
            done();
        });
    });

    test("should return credit cards", done => {
        request(WS_URL + "/cards", (error, response, body) => {
            expect(response).toBeTruthy();
            expect(response.statusCode).toBe(200);
            expect(error).toBeNull();
            expect(response.headers[contentTypeHeader]).toContain("json");

            const obj = JSON.parse(body);
            const ccListProperty = "credit_cards";

            expect(obj).toHaveProperty("status", "OK");
            expect(obj).toHaveProperty(ccListProperty);
            expect(obj[ccListProperty].length).toBeGreaterThan(1);
            const countCC = obj[ccListProperty].reduce(
                (i: number, v: ICreditCard) =>
                    v.type === PaymentMethodType.CREDIT_CARD ? i + 1 : i,
                0
            );
            expect(obj[ccListProperty].length).toBe(countCC);
            done();
        });
    });

    test("should return a SINGLE credit card", done => {
        request(WS_URL + "/cards/3", (error, response, body) => {
            expect(response).toBeTruthy();
            expect(response.statusCode).toBe(200);
            expect(error).toBeNull();
            expect(response.headers[contentTypeHeader]).toContain("json");
            const obj = JSON.parse(body);
            const ccProperty = "credit_card";
            expect(obj).toHaveProperty("status", "OK");
            expect(obj).toHaveProperty(ccProperty);
            expect(obj[ccProperty]).toEqual({
                id: "3",
                type: PaymentMethodType.CREDIT_CARD,
                issuer: "Mastercard",
                number: "Non ci sono nuove transazioni",
                message: "5412 7556 7890 0000"
            });
            done();
        });
    });
});

afterAll(() => {
    server.close();
});
