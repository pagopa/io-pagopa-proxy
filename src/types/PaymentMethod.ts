/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 *
 */

export enum PaymentMethodType {
    BANK_ACCOUNT,
    CREDIT_CARD,
    OTHER
}

export interface IPaymentMethod {
    readonly id: string; // ID of the specific payment method, ie: 2 credit cards
    // have different ids but same PaymentMethodType
    readonly type: PaymentMethodType;
}
