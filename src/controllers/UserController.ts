/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 *
 */

import * as Mocked from "../MockedData";

import { Option, some, none } from "fp-ts/lib/Option";

import { CreditCard } from "../types/CreditCard";
import { PaymentMethod, PaymentMethodType } from "../types/PaymentMethod";
import { ITransaction } from "../types/Transaction";
import { IUser } from "../types/User";

/**
 * User Controller
 */
export class UserController {
    constructor(public user: IUser) { }

    public getWallet(): ReadonlyArray<PaymentMethod> {
        return Mocked.wallet;
    }

    public getCreditCards(): ReadonlyArray<CreditCard> {
        return Mocked.wallet
            .filter(method => method.type === PaymentMethodType.decode("CREDIT_CARD").value)
            .map(card => card as CreditCard);
    }

    public getCreditCard(id: string): Option<CreditCard> {
        const paymentMethod = Mocked.wallet.filter(
            method =>
                method.id === id &&
                method.type === PaymentMethodType.decode("CREDIT_CARD").value
        )[0];

        if (paymentMethod === undefined) {
            return none;
        }

        return some(paymentMethod as CreditCard);
    }

    public getTransactions(
        paymentMethod: PaymentMethod
    ): ReadonlyArray<ITransaction> {
        return Mocked.operations.filter(
            operation => operation.method.id === paymentMethod.id
        );
    }

    public getLatestTransactions(
        maxOperations: number
    ): ReadonlyArray<ITransaction> {
        return Mocked.operations.slice(1, maxOperations + 1);
    }

    public getToken(): string {
        return this.user.token;
    }
}
