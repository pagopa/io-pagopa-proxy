/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 *
 */

import * as Mocked from "../MockedData";
import { ICreditCard } from "../types/CreditCard";
import { IPaymentMethod, PaymentMethodType } from "../types/PaymentMethod";
import { ITransaction } from "../types/Transaction";
import { IUser } from "../types/User";

/**
 * User Controller
 */
export class UserController {
    constructor(public user: IUser) {}

    public getWallet(): ReadonlyArray<IPaymentMethod> {
        return Mocked.wallet;
    }

    public getCreditCards(): ReadonlyArray<ICreditCard> {
        return Mocked.wallet
            .filter(method => method.type === PaymentMethodType.CREDIT_CARD)
            .map(card => card as ICreditCard);
    }

    public getCreditCard(id: string): ICreditCard | undefined {
        const paymentMethod = Mocked.wallet.filter(
            method =>
                method.id === id &&
                method.type === PaymentMethodType.CREDIT_CARD
        )[0];

        if (paymentMethod === undefined) {
            return undefined;
        }

        return paymentMethod as ICreditCard;
    }

    public getOperations(
        paymentMethod: IPaymentMethod
    ): ReadonlyArray<ITransaction> {
        return Mocked.operations.filter(
            operation => operation.method.id === paymentMethod.id
        );
    }

    public getLatestOperations(
        maxOperations: number
    ): ReadonlyArray<ITransaction> {
        return Mocked.operations.slice(1, maxOperations + 1);
    }

    public getToken(): string {
        return this.user.token;
    }
}
