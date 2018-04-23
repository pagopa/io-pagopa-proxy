/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 *
 */

import { CreditCard } from "../types/CreditCard";
import { PaymentMethod, PaymentMethodType } from "../types/PaymentMethod";
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
        const optionalCC = userController.getCreditCard("1");
        const mockCard: CreditCard = {
            id: "1",
            type: PaymentMethodType.decode("CREDIT_CARD").getOrElse(-1),
            issuer: "American Express",
            message: "Ultimo utilizzo ieri alle 07:34",
            number: "3759 876543 21001"
        };
        expect(optionalCC.isSome()).toBeTruthy();
        const creditCard: PaymentMethod = optionalCC.getOrElse(mockCard) as PaymentMethod;
        const transactions = userController.getTransactions(creditCard);
        expect(transactions).toBeTruthy();
        expect(transactions.length).toBe(3);
    });

    test("should get latest transactions", () => {
        const userController: UserController = new UserController(user);
        const MAX_TRANSACTIONS = 5;
        const transactions = userController.getLatestTransactions(MAX_TRANSACTIONS);
        expect(transactions).toBeTruthy();
        expect(transactions).toHaveLength(MAX_TRANSACTIONS);
    });

    test("should get user's token", () => {
        const userController: UserController = new UserController(user);
        const token = userController.getToken();
        expect(token).toBe(user.token);
    });
});
