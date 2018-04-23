/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 *
 */

import * as Mocked from "../MockedData";
import { UserController } from "./UserController";

export class CreditCardController extends UserController
{
    constructor(userId: string)
    {
        super(userId);
    }

    public getCreditCards(): ReadonlyArray<CreditCard>
    {
        return Mocked.cards;
    }

    public getCreditCard(creditCardId: number): CreditCard | undefined
    {
        return Mocked.cards.find(card => card.id === creditCardId);
    }
}
