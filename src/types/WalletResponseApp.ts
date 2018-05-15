/**
 * Wallet Response Types
 * Define response interfaces used by controllers for Wallet services
 */
import * as t from "io-ts";

export const PaymentMethodApp = t.intersection([
  t.interface({
    idWallet: t.number,
    type: t.string,
    favourite: t.boolean,
    pspBusinessName: t.string,
    pspServiceName: t.string
  }),
  t.partial({
    lastUsage: t.string,
    cardPan: t.string
  })
]);
export type PaymentMethodApp = t.TypeOf<typeof PaymentMethodApp>;

export const WalletResponseApp = t.interface({
  wallet: t.array(PaymentMethodApp)
});
export type WalletResponseApp = t.TypeOf<typeof WalletResponseApp>;
