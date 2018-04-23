/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 *
 */
import { CreditCardController } from "./CreditCardController";

describe("Credit Card controller", () =>
{
    test("should get user's specific card", () =>
    {
        const userCreditCards = new CreditCardController("USER001");
        const creditCards = userCreditCards.getCreditCard(1);
        expect(creditCards).toBeTruthy();
    });

    test("should get user's credit cards", () =>
    {
        const userCreditCards = new CreditCardController("USER001");
        const creditCards = userCreditCards.getCreditCards();
        expect(creditCards).toBeTruthy();
        expect(creditCards.length).toBe(4);
    });
});
