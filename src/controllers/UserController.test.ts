/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 *
 */

import { IPaymentMethod } from "../types/PaymentMethod";
import { IUser } from "../types/User";
import { UserController } from "./UserController";

describe("User controller", () => {
    const user: IUser = {
        token: "kdhkehfjheiuy329"
    };

    test("should get user's specific card", () => {
        const userController: UserController = new UserController(user);
        const creditCards = userController.getCreditCard("1");
        expect(creditCards).toBeTruthy();
    });

    test("should get user's credit cards", () => {
        const userController: UserController = new UserController(user);
        const creditCards = userController.getCreditCards();
        expect(creditCards).toBeTruthy();
        expect(creditCards.length).toBe(4);
    });

    test("should get credit cards' transactions", () => {
        const userController: UserController = new UserController(user);
        const creditCard: IPaymentMethod = userController.getCreditCard(
            "1"
        ) as IPaymentMethod;
        const creditCards = userController.getOperations(creditCard);
        expect(creditCards).toBeTruthy();
        expect(creditCards.length).toBe(3);
    });

    test("should get latest transactions", () => {
        const userController: UserController = new UserController(user);
        const MAX_OPERATIONS = 5;
        const operations = userController.getLatestOperations(MAX_OPERATIONS);
        expect(operations).toBeTruthy();
        expect(operations).toHaveLength(MAX_OPERATIONS);
    });

    test("should get user's token", () => {
        const userController: UserController = new UserController(user);
        const token = userController.getToken();
        expect(token).toBe(user.token);
    });
});
