import { fixImportoSingoloVersamentoDigits } from "../SoapUtils";

describe("fixImportoSingoloVersamentoDigits", () => {
  it("should fix format of ImportoSingoloVersamento", () => {
    [
      [
        "<importoSingoloVersamento>0.01</importoSingoloVersamento>",
        "<importoSingoloVersamento>0.01</importoSingoloVersamento>"
      ],
      [
        "<importoSingoloVersamento>\n 0.01</importoSingoloVersamento>",
        "<importoSingoloVersamento>\n 0.01</importoSingoloVersamento>"
      ],
      [
        "<importoSingoloVersamento>0.01\n</importoSingoloVersamento>",
        "<importoSingoloVersamento>0.01\n</importoSingoloVersamento>"
      ],
      [
        "<importoSingoloVersamento>\n0.01\n</importoSingoloVersamento>",
        "<importoSingoloVersamento>\n0.01\n</importoSingoloVersamento>"
      ],
      [
        "<importoSingoloVersamento>\n0\n</importoSingoloVersamento>",
        "<importoSingoloVersamento>\n0.00\n</importoSingoloVersamento>"
      ],
      [
        "<importoSingoloVersamento>\n123\n</importoSingoloVersamento>",
        "<importoSingoloVersamento>\n123.00\n</importoSingoloVersamento>"
      ],
      [
        "<importoSingoloVersamento>\n0.1\n</importoSingoloVersamento>",
        "<importoSingoloVersamento>\n0.10\n</importoSingoloVersamento>"
      ],
      [
        "<importoSingoloVersamento>\n0.12\n</importoSingoloVersamento>",
        "<importoSingoloVersamento>\n0.12\n</importoSingoloVersamento>"
      ],
      [
        "<importoSingoloVersamento>\n0.234\n</importoSingoloVersamento>",
        "<importoSingoloVersamento>\n0.23\n</importoSingoloVersamento>"
      ]
    ].forEach(([pre, post]) =>
      expect(fixImportoSingoloVersamentoDigits(pre)).toEqual(post)
    );
  });
});
