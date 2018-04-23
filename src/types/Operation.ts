/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 *
 */

class Operation
{
    public readonly cardId: number;
    public readonly date: string;
    public readonly time: string;
    public readonly subject: string;
    public readonly recipient: string;
    public readonly amount: number;
    public readonly currency: string;
    public readonly transactionCost: number;
    public readonly isNew: boolean;
}
