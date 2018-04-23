/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 *
 */

import * as Mocked from "../MockedData";
import { UserController } from "./UserController";

export class OperationController extends UserController
{
    constructor(userId: string)
    {
        super(userId);
    }

    public getOperations(cardId: number): ReadonlyArray<Operation>
    {
        return Mocked.operations.filter(operation => operation.cardId === cardId);
    }

    public getLatestOperations(maxOperations: number): ReadonlyArray<Operation>
    {
        return Mocked.operations.slice(1, maxOperations + 1);
    }
}
