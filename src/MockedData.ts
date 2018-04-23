/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 *
 */

import { CreditCard } from "./types/CreditCard";
import { PaymentMethod, PaymentMethodType } from "./types/PaymentMethod";
import { ITransaction } from "./types/Transaction";

/**
 * Generate Credit Card
 * @param {string} id
 * @param {string} issuer
 * @param {string} num
 * @param {string} message
 * @returns {CreditCard}
 */
function genCC(
    id: string,
    issuer: string,
    num: string,
    message: string
): CreditCard {
    return {
        id,
        type: PaymentMethodType.decode("CREDIT_CARD").getOrElse(-1),
        issuer,
        number: num,
        message
    };
}

/**
 * Selection of payment methods
 * @type {CreditCard[]}
 */
export const wallet: ReadonlyArray<PaymentMethod> = [
    genCC(
        "1",
        "American Express",
        "Ultimo utilizzo ieri alle 07:34",
        "3759 876543 21001"
    ),
    genCC(
        "2",
        "VISA",
        "Ultimo utilizzo ieri alle 10:20",
        "4000 1234 5678 9010"
    ),
    genCC(
        "3",
        "Mastercard",
        "Non ci sono nuove transazioni",
        "5412 7556 7890 0000"
    ),
    genCC(
        "4",
        "RedCard",
        "Ultimo utilizzo oggi alle 09:03",
        "4000 1234 5678 9010"
    )
];

/**
 * List of transactions
 */
export const operations: ReadonlyArray<ITransaction> = [
    {
        method: wallet[0],
        date: "17/04/2018",
        time: "07:34",
        description: "Certificato di residenza",
        recipient: "Comune di Gallarate",
        amount: -20.02,
        currency: "EUR",
        fee: 0.5,
        isNew: true
    },
    {
        method: wallet[1],
        date: "16/04/2018",
        time: "15:01",
        description: "Spesa Supermarket",
        recipient: "Segrate",
        amount: -74.1,
        currency: "EUR",
        fee: 0.5,
        isNew: true
    },
    {
        method: wallet[3],
        date: "15/04/2018",
        time: "08:56",
        description: "Prelievo contante",
        recipient: "Busto Arsizio", // tslint:disable-line
        amount: -200.0,
        currency: "EUR",
        fee: 0.5,
        isNew: true
    },
    {
        method: wallet[1],
        date: "14/02/2018",
        time: "10:21",
        description: "Accredito per storno",
        recipient: "Banca Sella",
        amount: 100.1,
        currency: "USD",
        fee: 0.5,
        isNew: false
    },
    {
        method: wallet[3],
        date: "22/01/2018",
        time: "14:54",
        description: "Esecuzione atti notarili",
        recipient: "Comune di Legnano",
        fee: 0.5,
        amount: -56.0,
        currency: "EUR",
        isNew: false
    },
    {
        method: wallet[3],
        date: "01/01/2018",
        time: "23:34",
        description: "Pizzeria Da Gennarino",
        recipient: "Busto Arsizio",
        amount: -45.0,
        currency: "EUR",
        fee: 0.5,
        isNew: false
    },
    {
        method: wallet[0],
        date: "22/12/2017",
        time: "14:23",
        description: "Rimborso TARI 2012",
        recipient: "Comune di Gallarate",
        amount: 150.2,
        currency: "EUR",
        fee: 0,
        isNew: false
    },
    {
        method: wallet[0],
        date: "17/12/2017",
        time: "12:34",
        description: "Ristorante I Pini",
        recipient: "Busto Arsizio",
        fee: 0,
        amount: -134.0,
        currency: "EUR",
        isNew: false
    },
    {
        method: wallet[2],
        date: "13/12/2017",
        time: "10:34",
        description: "Estetista Estella",
        recipient: "Milano - via Parini 12",
        fee: 0.5,
        amount: -100.0,
        currency: "EUR",
        isNew: false
    }
];
