/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 *
 *
 */

import * as express from "express";
import * as supertest from "supertest";

import { newApp } from "../App";
import { CreditCard } from "../types/CreditCard";
import { PaymentMethod } from "../types/PaymentMethod";
import { StatusCode } from "../types/StatusCode";

import { wallet } from "../MockedData";

const PORT = 3000;

let app: express.Application; // tslint:disable-line
let request: supertest.SuperTest<supertest.Test>; // tslint:disable-line

beforeAll(() => {
  app = newApp(false);
  app.set("port", PORT);
  request = supertest(app);
});

describe("App", () => {
  const contentTypeHeader = "content-type";

  test("should return a wallet", () => {
    return request.get("/wallet?token=test").then(response => {
      expect(response.status).toBe(200);
      expect(response.error).toBeFalsy();
      expect(response.header[contentTypeHeader]).toContain("json");

      const obj = response.body;
      const walletProperty = "wallet";

      expect(obj).toHaveProperty("status", StatusCode.OK);
      expect(obj).toHaveProperty(walletProperty);
      expect(obj[walletProperty].length).toBeGreaterThan(1);
      expect(
        obj[walletProperty].reduce(
          (a: boolean, b: object) => a && PaymentMethod.decode(b).isRight(),
          true
        )
      ).toBeTruthy();
    });
  });

  test("should return credit cards", () => {
    return request.get("/cards?token=test").then(response => {
      expect(response.status).toBe(200);
      expect(response.error).toBeFalsy();
      expect(response.header[contentTypeHeader]).toContain("json");

      const obj = response.body;
      const ccListProperty = "credit_cards";

      expect(obj).toHaveProperty("status", StatusCode.OK);
      expect(obj).toHaveProperty(ccListProperty);
      expect(obj[ccListProperty].length).toBeGreaterThan(1);
      expect(
        obj[ccListProperty].reduce(
          (a: boolean, b: object) => a && CreditCard.decode(b).isRight(),
          true
        )
      ).toBeTruthy();
    });
  });

  test("should return a SINGLE credit card", () => {
    const testedCardId = "3";
    return request.get(`/cards/${testedCardId}?token=test`).then(response => {
      expect(response.status).toBe(200);
      expect(response.error).toBeFalsy();
      expect(response.header[contentTypeHeader]).toContain("json");
      const obj = response.body;
      const ccProperty = "credit_card";
      expect(obj).toHaveProperty("status", StatusCode.OK);
      expect(obj).toHaveProperty(ccProperty);
      expect(CreditCard.decode(obj[ccProperty]).isRight()).toBeTruthy();
      expect(obj[ccProperty]).toEqual(wallet.find(c => c.id === testedCardId));
    });
  });
});
