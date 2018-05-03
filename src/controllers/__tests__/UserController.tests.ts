/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 *
 */

import mockReq from "../../__mocks__/request";
import mockRes from "../../__mocks__/response";

import { UserController } from "../../controllers/UserController";

import { MOCK_USER } from "../../MockedData";

describe("User controller", () => {
  const userController = new UserController();

  test("should get user's specific card", () => {
    const req = mockReq();
    req.query = { token: MOCK_USER.token, cardId: "1" };
    const res = mockRes();
    userController.getCreditCards(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  test("should get user's credit cards", () => {
    const req = mockReq();
    req.query = { token: MOCK_USER.token };
    const res = mockRes();
    userController.getCreditCards(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });
});
