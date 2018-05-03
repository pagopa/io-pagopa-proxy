/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 *
 */

import mockReq from "../../__mocks__/request";
import mockRes from "../../__mocks__/response";

import { TransactionController } from "../../controllers/TransactionController";

import { MOCK_USER } from "../../MockedData";

describe("Transaction controller", () => {
  const transactionController = new TransactionController();

  test("should get at list one transaction", () => {
    const req = mockReq();
    req.query = { token: MOCK_USER.token };
    const res = mockRes();
    transactionController.getTransactions(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });
});
