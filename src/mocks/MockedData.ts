import { CONFIG } from "../Configuration";
import { FiscalCode, IUV } from "../types/CommonTypes";
export const CORRECT_CF = FiscalCode.decode("BDAGPP36H07C351L");
export const NON_CORRECT_CF = "BDAGPP36H07C351LAX";

export const CORRECT_COD_IUV = IUV.decode("105983676029386");
export const NON_CORRECT_COD_IUV = "1059836760293860000000";

export const CORRECT_AUX_DIGIT = "2";
export const NON_CORRECT_AUX_DIGIT = "99";

export const INCORRECT_PAYMENT_CHECK_REQUEST_CF = {
  codiceIdRPT: {
    CF: NON_CORRECT_CF, // Incorrect CF
    AuxDigit: CORRECT_AUX_DIGIT,
    CodIUV: CORRECT_COD_IUV
  }
};

export const INCORRECT_PAYMENT_CHECK_REQUEST_COD_IUV = {
  codiceIdRPT: {
    CF: CORRECT_CF,
    AuxDigit: "2",
    CodIUV: NON_CORRECT_COD_IUV // Incorrect CodIUV
  }
};

export const VALID_CODICE_CONTESTO_PAGAMENTO = "AXPOIEHKSPGO93INBSOJ";
export const INVALID_CODICE_CONTESTO_PAGAMENTO =
  "JFP39JFOO38HGNYE872YHBII9SHJ084HJG0BCU0A";

export const PAGOPA_CONFIG = {
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
};
export const CODICE_CONTESTO_PAGAMENTO = "1A";

export const CORRECT_NODO_ATTIVA_RPT_OUTPUT = {
  esito: "OK",
  datiPagamento: {
    importoSingoloVersamento: 110,
    ibanAccredito: "IT60X0542811101000000123456",
    bicAccredito: "LOYDCHGGZCH",
    credenzialiPagatore: "username",
    spezzoniCausaleVersamento: {
      spezzoneCausaleVersamento: 1,
      spezzoneStrutturatoCausaleVersamento: {
        causaleSpezzone: "pagamento multa",
        importoSpezzone: 110
      }
    },
    enteBeneficiario: {
      identificativoUnivocoBeneficiario: {
        tipoIdentificativoUnivoco: "F",
        codiceIdentificativoUnivoco: CORRECT_CF
      },
      denominazioneBeneficiario: "banca",
      codiceUnitOperBeneficiario: "AX1234",
      denomUnitOperBeneficiario: "unit operativa",
      indirizzoBeneficiario: "Via Roma",
      civicoBeneficiario: "11",
      capBeneficiario: "00146",
      localitaBeneficiario: "Roma",
      provinciaBeneficiario: "Roma",
      nazioneBeneficiario: "Italia"
    }
  }
};
