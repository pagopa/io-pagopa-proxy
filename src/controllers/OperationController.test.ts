/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 *
 */

import { OperationController } from "./OperationController";

describe("Operation controller", () =>
{
    test("should get latest operations", () =>
    {
        const operationsController = new OperationController("USER001");
        const operations = operationsController.getLatestOperations(5);
        expect(operations).toBeTruthy();
        expect(operations.length).toBe(5);
    });

    test("should get credit cards' operations", () =>
    {
        const operationsController = new OperationController("USER001");
        const operations = operationsController.getOperations(1);
        expect(operations).toBeTruthy();
        expect(operations.length).toBe(3);
    });
});
