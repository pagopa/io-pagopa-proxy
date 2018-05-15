/**
 * LoginResponse Types
 * Define response interfaces used by PagoPaAPI for Login services
 */

import * as t from "io-ts";

export const LoginResponse = t.interface({
  apiRequestToken: t.string,
  user: t.interface({
    acceptTerms: t.boolean,
    cellphone: t.string,
    email: t.string,
    name: t.string,
    puk: t.string,
    spidToken: t.string,
    surname: t.string,
    temporaryCellphone: t.string,
    username: t.string
  })
});
export type LoginResponse = t.TypeOf<typeof LoginResponse>;

export const LoginAnonymousResponse = t.interface({
  apiRequestToken: t.string,
  approveTerms: t.interface({
    type: t.string,
    properties: t.interface({
      privacy: t.string,
      terms: t.string
    }),
    title: t.string
  })
});
export type LoginAnonymousResponse = t.TypeOf<typeof LoginAnonymousResponse>;
