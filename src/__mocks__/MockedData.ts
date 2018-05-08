/* tslint:disable */

/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 
function genCC(
  id: string,
  issuer: NonEmptyString,
  num: CreditCardNumber,
  message: string
): CreditCard {
  return {
    id,
    type: PaymentMethodType.decode("CREDIT_CARD").getOrElse(
      PaymentMethodEnum.OTHER
    ),
    issuer,
    number: num,
    message
  };
}

export const NO_CARD: CreditCard = genCC(
  "-1",
  "N/A" as NonEmptyString,
  "0000 0000 0000 0000" as CreditCardNumber,
  "N/A"
);

export const MOCK_USER: User = { token: "0123456789abcdef" as NonEmptyString };

/**
 * Selection of payment methods
 * @type {CreditCard[]}
 
export const wallet: ReadonlyArray<PaymentMethod> = [
  genCC(
    "1",
    "American Express" as NonEmptyString,
    "3759 8765 1233 1001" as CreditCardNumber,
    "Ultimo utilizzo ieri alle 07:34"
  ),
  genCC(
    "2",
    "VISA" as NonEmptyString,
    "4000 1234 5678 9010" as CreditCardNumber,
    "Ultimo utilizzo ieri alle 10:20"
  ),
  genCC(
    "3",
    "Mastercard" as NonEmptyString,
    "5412 7556 7890 0000" as CreditCardNumber,
    "Non ci sono nuove transazioni"
  ),
  genCC(
    "4",
    "RedCard" as NonEmptyString,
    "4000 1234 5678 9010" as CreditCardNumber,
    "Ultimo utilizzo oggi alle 09:03"
  )
];

/**
 * List of transactions
 
const now = new Date();

export const transactions: ReadonlyArray<Transaction> = [
  {
    id: "1",
    method: wallet[0],
    date: DateFromString.decode("2018-04-24T10:26:02.818Z").getOrElse(now),
    description: "Certificato di residenza",
    recipient: "Comune di Gallarate" as NonEmptyString,
    amount: {
      quantity: 22.2,
      precision: 2 as NonNegativeNumber,
      currency: "EUR" as CountryCurrencyCode
    },
    fee: {
      quantity: 0.5,
      precision: 2 as NonNegativeNumber,
      currency: "EUR" as CountryCurrencyCode
    }
  },
  {
    id: "2",
    method: wallet[1],
    date: DateFromString.decode("2018-04-23T10:26:02.818Z").getOrElse(now),
    description: "Spesa Supermarket",
    recipient: "Segrate" as NonEmptyString,
    amount: {
      quantity: -74.1,
      precision: 2 as NonNegativeNumber,
      currency: "EUR" as CountryCurrencyCode
    },
    fee: {
      quantity: 0.5,
      precision: 2 as NonNegativeNumber,
      currency: "EUR" as CountryCurrencyCode
    }
  },
  {
    id: "3",
    method: wallet[3],
    date: DateFromString.decode("2018-03-23T10:26:02.810Z").getOrElse(now),
    description: "Prelievo contante",
    recipient: "Busto Arsizio" as NonEmptyString,
    amount: {
      quantity: -200,
      precision: 2 as NonNegativeNumber,
      currency: "EUR" as CountryCurrencyCode
    },
    fee: {
      quantity: 0.5,
      precision: 2 as NonNegativeNumber,
      currency: "EUR" as CountryCurrencyCode
    }
  },
  {
    id: "4",
    method: wallet[1],
    date: DateFromString.decode("2018-03-14T23:26:02.810Z").getOrElse(now),
    description: "Accredito per storno",
    recipient: "Banca Sella" as NonEmptyString,
    amount: {
      quantity: 100.1,
      precision: 2 as NonNegativeNumber,
      currency: "EUR" as CountryCurrencyCode
    },
    fee: {
      quantity: 0.5,
      precision: 2 as NonNegativeNumber,
      currency: "EUR" as CountryCurrencyCode
    }
  },
  {
    id: "5",
    method: wallet[3],
    date: DateFromString.decode("2018-03-20T10:33:02.810Z").getOrElse(now),
    description: "Esecuzione atti notarili",
    recipient: "Comune di Legnano" as NonEmptyString,
    amount: {
      quantity: -56.0,
      precision: 2 as NonNegativeNumber,
      currency: "EUR" as CountryCurrencyCode
    },
    fee: {
      quantity: 0.5,
      precision: 2 as NonNegativeNumber,
      currency: "EUR" as CountryCurrencyCode
    }
  },
  {
    id: "6",
    method: wallet[3],
    date: DateFromString.decode("2018-03-23T10:26:02.810Z").getOrElse(now),
    description: "Aperitivo",
    recipient: "Birrificio Lambrate" as NonEmptyString,
    amount: {
      quantity: -45.0,
      precision: 2 as NonNegativeNumber,
      currency: "EUR" as CountryCurrencyCode
    },
    fee: {
      quantity: 0.5,
      precision: 2 as NonNegativeNumber,
      currency: "EUR" as CountryCurrencyCode
    }
  },
  {
    id: "7",
    method: wallet[0],
    date: DateFromString.decode("2017-02-21T10:20:02.810Z").getOrElse(now),
    description: "Rimborso TARI 2012",
    recipient: "Comune di Gallarate" as NonEmptyString,
    amount: {
      quantity: 150.2,
      precision: 2 as NonNegativeNumber,
      currency: "EUR" as CountryCurrencyCode
    },
    fee: {
      quantity: 0,
      precision: 2 as NonNegativeNumber,
      currency: "EUR" as CountryCurrencyCode
    }
  },
  {
    id: "8",
    method: wallet[0],
    date: DateFromString.decode("2018-03-23T10:26:01.810Z").getOrElse(now),
    description: "Ristorante I Pini",
    recipient: "Busto Arsizio" as NonEmptyString,
    amount: {
      quantity: -134.0,
      precision: 2 as NonNegativeNumber,
      currency: "EUR" as CountryCurrencyCode
    },
    fee: {
      quantity: 0,
      precision: 2 as NonNegativeNumber,
      currency: "EUR" as CountryCurrencyCode
    }
  },
  {
    id: "9",
    method: wallet[2],
    date: DateFromString.decode("2018-03-23T20:26:02.810Z").getOrElse(now),
    description: "Estetista Estella",
    recipient: "Milano - via Parini 12" as NonEmptyString,
    amount: {
      quantity: -100.0,
      precision: 2 as NonNegativeNumber,
      currency: "EUR" as CountryCurrencyCode
    },
    fee: {
      quantity: 0.5,
      precision: 2 as NonNegativeNumber,
      currency: "EUR" as CountryCurrencyCode
    }
  }
];
*/
