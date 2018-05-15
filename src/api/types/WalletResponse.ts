/**
 * WalletResponse Types
 * Define response interfaces used by PagoPaAPI for Wallet services
 */

import * as t from "io-ts";
import { Os, Properties } from "./BaseResponse";

export const PaymentMethod = t.intersection([
  t.interface({
    favourite: t.boolean,
    idPagamentoFromEC: t.string,
    idPsp: t.string,
    idWallet: t.number,
    pspEditable: t.boolean,
    type: t.string,
    psp: t.intersection([
      t.interface({
        businessName: t.string,
        fixedCost: Properties,
        idPsp: t.string,
        paymentType: t.string,
        serviceName: t.string,
        urlInfoChannel: t.string
      }),
      t.partial({
        appChannel: t.string,
        flagStamp: t.string,
        cancelled: t.string,
        id: t.string,
        lingua: Os,
        idCard: t.string,
        idChannel: t.string,
        idIntermediary: t.string,
        logoPSP: t.string,
        paymentModel: t.number,
        tags: t.interface({
          type: t.string,
          items: Os
        }),
        serviceLogo: t.string,
        serviceAvailability: t.string,
        serviceDescription: t.string
      })
    ])
  }),
  t.partial({
    lastUsage: t.string,
    creditCard: t.intersection([
      t.interface({
        brandLogo: t.string,
        expireMonth: t.string,
        expireYear: t.string,
        holder: t.string,
        id: t.number,
        pan: t.string
      }),
      t.partial({
        flag3dsVerified: t.string,
        securityCode: t.string
      })
    ])
  })
]);
export type PaymentMethod = t.TypeOf<typeof PaymentMethod>;

export const WalletResponse = t.interface({
  data: t.array(PaymentMethod)
});
export type WalletResponse = t.TypeOf<typeof WalletResponse>;
