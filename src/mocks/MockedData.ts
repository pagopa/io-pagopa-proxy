import { CONFIG, PagoPaConfig } from "../Configuration";
import { PaymentsCheckRequest } from "../types/controllers/PaymentsCheckRequest";
import { CodiceContestoPagamento } from "../types/PagoPaTypes";

export const CORRECT_PAYMENT_CHECK_REQUEST = PaymentsCheckRequest.decode({
  codiceIdRPT: {
    CF: "BDAGPP36H07C351L",
    AuxDigit: 2,
    CodIUV: "105983676029386"
  }
});

export const INCORRECT_PAYMENT_CHECK_REQUEST_CF = PaymentsCheckRequest.decode({
  codiceIdRPT: {
    CF: "BDAGPP36H07C351LAX", // Incorrect CF
    AuxDigit: "2",
    CodIUV: "105983676029386"
  }
});

export const INCORRECT_PAYMENT_CHECK_REQUEST_AUX_DIGIT = PaymentsCheckRequest.decode(
  {
    codiceIdRPT: {
      CF: "BDAGPP36H07C351L",
      AuxDigit: "99", // Incorrect AuxDigit
      CodIUV: "105983676029386"
    }
  }
);

export const INCORRECT_PAYMENT_CHECK_REQUEST_COD_IUV = PaymentsCheckRequest.decode(
  {
    codiceIdRPT: {
      CF: "BDAGPP36H07C351L",
      AuxDigit: "2",
      CodIUV: "1059836760293860000000" // Incorrect CodIUV
    }
  }
);

export const VALID_CODICE_CONTESTO_PAGAMENTO = CodiceContestoPagamento.decode(
  "AXPOIEHKSPGO93INBSOJ"
);
export const INVALID_CODICE_CONTESTO_PAGAMENTO = CodiceContestoPagamento.decode(
  "JFP39JFOO38HGNYE872YHBII9SHJ084HJG0BCU0A"
);

export const PAGOPA_CONFIG = PagoPaConfig.decode({
  HOST: CONFIG.PAGOPA.HOST,
  PORT: CONFIG.PAGOPA.PORT,
  SERVICES: {
    PAYMENTS_CHECK: CONFIG.PAGOPA.SERVICES.PAYMENTS_CHECK,
    PAYMENTS_ACTIVATION: CONFIG.PAGOPA.SERVICES.PAYMENTS_ACTIVATION
  },
  IDENTIFIER: {
    IDENTIFICATIVO_PSP: CONFIG.PAGOPA.IDENTIFIER.IDENTIFICATIVO_PSP,
    IDENTIFICATIVO_INTERMEDIARIO_PSP:
      CONFIG.PAGOPA.IDENTIFIER.IDENTIFICATIVO_INTERMEDIARIO_PSP,
    IDENTIFICATIVO_CANALE: CONFIG.PAGOPA.IDENTIFIER.IDENTIFICATIVO_CANALE,
    TOKEN: CONFIG.PAGOPA.IDENTIFIER.TOKEN
  }
});
