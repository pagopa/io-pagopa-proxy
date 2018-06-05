import * as t from "io-ts";
import {
  EmailString,
  PatternString,
  WithinRangeString
} from "italia-ts-commons/lib/strings";
import { Iban, Importo } from "./CommonTypes";

export const Text16 = WithinRangeString(1, 16);
export type Text16 = t.TypeOf<typeof Text16>;

export const Text35 = WithinRangeString(1, 35);
export type Text35 = t.TypeOf<typeof Text35>;

export const Text70 = WithinRangeString(1, 70);
export type Text70 = t.TypeOf<typeof Text70>;

export const Text140 = WithinRangeString(1, 140);
export type Text140 = t.TypeOf<typeof Text140>;

export const ISODate = PatternString(
  "[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}"
);
export type ISODate = t.TypeOf<typeof ISODate>;

export const CellulareSoggetto = PatternString(
  "+[0-9]{2,2}s[0-9]{3,3}-[0-9]{7,7}"
);
export type CellulareSoggetto = t.TypeOf<typeof CellulareSoggetto>;

export const Bic = PatternString(
  "[A-Z]{6,6}[A-Z2-9][A-NP-Z0-9]([A-Z0-9]{3,3}){0,1}"
);
export type Bic = t.TypeOf<typeof Bic>;
export const Email = EmailString;
export type Email = t.TypeOf<typeof Email>;

export const CodiceContestoPagamento = Text35;
export type CodiceContestoPagamento = t.TypeOf<typeof Text35>;

export const SpezzoneStrutturatoCausaleVersamento = t.intersection([
  t.interface({
    spezzoneCausaleVersamento: WithinRangeString(1, 25),
    importoSpezzone: Importo
  })
]);
export type SpezzoneStrutturatoCausaleVersamento = t.TypeOf<
  typeof SpezzoneStrutturatoCausaleVersamento
>;

export const SpezzoniCausaleVersamento = t.intersection([
  t.interface({
    spezzoneCausaleVersamento: WithinRangeString(1, 35),
    spezzoneStrutturatoCausaleVersamento: SpezzoneStrutturatoCausaleVersamento
  })
]);
export type SpezzoniCausaleVersamento = t.ArrayType<
  typeof SpezzoniCausaleVersamento
>;

export const datiPagamentoPA = t.intersection([
  t.interface({
    importoSingoloVersamento: Importo,
    ibanAccredito: Iban,
    bicAccredito: Bic,
    credenzialiPagatore: Text35,
    causaleVersamento: Text140,
    spezzoniCausaleVersamento: SpezzoniCausaleVersamento
  })
]);
