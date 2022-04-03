import { reporters } from "@pagopa/ts-commons";
import * as soap from "soap";
import { esitoNodoAttivaRPTRisposta_type_ppt } from "../../../generated/PagamentiTelematiciPspNodoservice/esitoNodoAttivaRPTRisposta_type_ppt";
import { esitoNodoVerificaRPTRisposta_type_ppt } from "../../../generated/PagamentiTelematiciPspNodoservice/esitoNodoVerificaRPTRisposta_type_ppt";
import { nodoAttivaRPT_element_ppt } from "../../../generated/PagamentiTelematiciPspNodoservice/nodoAttivaRPT_element_ppt";
import { nodoAttivaRPTRisposta_element_ppt } from "../../../generated/PagamentiTelematiciPspNodoservice/nodoAttivaRPTRisposta_element_ppt";
import { nodoVerificaRPT_element_ppt } from "../../../generated/PagamentiTelematiciPspNodoservice/nodoVerificaRPT_element_ppt";
import { nodoVerificaRPTRisposta_element_ppt } from "../../../generated/PagamentiTelematiciPspNodoservice/nodoVerificaRPTRisposta_element_ppt";
import { IPPTPortSoap } from "../../services/pagopa_api/IPPTPortSoap";
import * as PPTPortClient from "../../services/pagopa_api/PPTPortClient";
import { createClient } from "../../utils/SoapUtils";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/lib/function";

const invalidInput = "Invalid input";

export async function createPagamentiTelematiciPspNodoClient(
  options: soap.IOptions
): Promise<soap.Client & IPPTPortSoap> {
  return createClient<IPPTPortSoap>(
    PPTPortClient.PAGAMENTI_TELEMATICI_PSP_WSDL_PATH,
    options
  );
}

const invalidResponse                      = "Invalid response";
const endIuvInvalidResponse                = "00";
const endTimeoutIuvInvalidResponse         = "11";
const endKoWithoudDetailsInvalidResponse   = "22";
const endKoPagamentoInCorsoInvalidResponse = "33";
const endNM3Response                       = "44";
const endNM3InvalidResponse                = "55";
const endNM3timeoutResponse                = "66";
const endNM3PagamentoInCorsoResponse       = "77";

const timeoutResponse       = {
  message: "ESOCKETTIMEDOUT"
};
const koWithouDetailsResponse       =  pipe(
  esitoNodoVerificaRPTRisposta_type_ppt.decode({
    esito: "KO"
  }),
  E.getOrElseW(errors => {
    throw Error(
      `Invalid esitoNodoVerificaRPTRisposta_type_ppt to decode: ${reporters.readableReport(
        errors
      )}`
    );
  })
);


const aNodoVerificaRPTRispostaOK = pipe(
  esitoNodoVerificaRPTRisposta_type_ppt.decode({
    esito: "OK",
    datiPagamentoPA: {
      importoSingoloVersamento: 99.05,
      ibanAccredito: "IT17X0605502100000001234567",
      bicAccredito: "BPPIITRR",
      enteBeneficiario: {
        identificativoUnivocoBeneficiario: {
          tipoIdentificativoUnivoco: "G",
          codiceIdentificativoUnivoco: "001"
        },
        denominazioneBeneficiario: "BANCA01",
        codiceUnitOperBeneficiario: "01",
        denomUnitOperBeneficiario: "DENOM01",
        indirizzoBeneficiario: "VIAROMA",
        civicoBeneficiario: "01",
        capBeneficiario: "00000",
        localitaBeneficiario: "ROMA",
        provinciaBeneficiario: "ROMA",
        nazioneBeneficiario: "IT"
      },
      credenzialiPagatore: "NOMECOGNOME",
      causaleVersamento: "CAUSALE01"
    }
  }),
  E.getOrElseW(errors => {
    throw Error(
      `Invalid esitoNodoVerificaRPTRisposta_type_ppt to decode: ${reporters.readableReport(
        errors
      )}`
    );
  })
);

const aNodoVerificaRPTRispostaPagamentoInCorso = pipe(
  esitoNodoVerificaRPTRisposta_type_ppt.decode({
    esito: "KO",
    fault:{ 
      faultCode: "PAA_PAGAMENTO_IN_CORSO",
      faultString: "Pagamento in corso", 
      id: "PAA_PAGAMENTO_IN_CORSO" 
    }
    }),
  E.getOrElseW(errors => {
    throw Error(
      `Invalid esitoNodoVerificaRPTRisposta_type_ppt to decode: ${reporters.readableReport(
        errors
      )}`
    );
  })
);

const aNodoVerificaRPTNM3 = pipe(
  esitoNodoVerificaRPTRisposta_type_ppt.decode({
    esito: "KO",
    fault:{ 
      faultCode: "PPT_MULTI_BENEFICIARIO",
      faultString: "Pagamento nm3", 
      id: "PPT_MULTI_BENEFICIARIO" 
    }
    }),
  E.getOrElseW(errors => {
    throw Error(
      `Invalid esitoNodoVerificaRPTRisposta_type_ppt to decode: ${reporters.readableReport(
        errors
      )}`
    );
  })
);

const aNodoVerificaRPTInvalidNM3 = pipe(
  esitoNodoVerificaRPTRisposta_type_ppt.decode({
    esito: "KO",
    fault:{ 
      faultCode: "PPT_MULTI_BENEFICIARIO",
      faultString: "Pagamento nm3", 
      id: "PPT_MULTI_BENEFICIARIO" 
    }
    }),
  E.getOrElseW(errors => {
    throw Error(
      `Invalid esitoNodoVerificaRPTRisposta_type_ppt to decode: ${reporters.readableReport(
        errors
      )}`
    );
  })
);

const aNodoAttivaRPTRispostaOK = pipe(
  esitoNodoAttivaRPTRisposta_type_ppt.decode({
    esito: "OK",
    datiPagamentoPA: {
      importoSingoloVersamento: 99.05,
      ibanAccredito: "IT17X0605502100000001234567",
      bicAccredito: "BPPIITRR",
      enteBeneficiario: {
        identificativoUnivocoBeneficiario: {
          tipoIdentificativoUnivoco: "G",
          codiceIdentificativoUnivoco: "001"
        },
        denominazioneBeneficiario: "BANCA01",
        codiceUnitOperBeneficiario: "01",
        denomUnitOperBeneficiario: "DENOM01",
        indirizzoBeneficiario: "VIAROMA",
        civicoBeneficiario: "01",
        capBeneficiario: "00000",
        localitaBeneficiario: "ROMA",
        provinciaBeneficiario: "ROMA",
        nazioneBeneficiario: "IT"
      },
      credenzialiPagatore: "NOMECOGNOME",
      causaleVersamento: "CAUSALE01"
    }
  }),
  E.getOrElseW(errors => {
    throw Error(
      `Invalid esitoNodoAttivaRPTRisposta_type_ppt to decode: ${reporters.readableReport(
        errors
      )}`
    );
  })
);

const aNodoAttivaRPTRispostaPagamentoInCorso = pipe(
  esitoNodoVerificaRPTRisposta_type_ppt.decode({
    esito: "KO",
    fault:{ 
      faultCode: "PAA_PAGAMENTO_IN_CORSO",
      faultString: "Pagamento in corso", 
      id: "PAA_PAGAMENTO_IN_CORSO" 
    }
    }),
  E.getOrElseW(errors => {
    throw Error(
      `Invalid esitoNodoVerificaRPTRisposta_type_ppt to decode: ${reporters.readableReport(
        errors
      )}`
    );
  })
);

const aNodoAttivaRPTNM3 = pipe(
  esitoNodoVerificaRPTRisposta_type_ppt.decode({
    esito: "KO",
    fault:{ 
      faultCode: "PPT_MULTI_BENEFICIARIO",
      faultString: "Pagamento nm3", 
      id: "PPT_MULTI_BENEFICIARIO" 
    }
    }),
  E.getOrElseW(errors => {
    throw Error(
      `Invalid esitoNodoVerificaRPTRisposta_type_ppt to decode: ${reporters.readableReport(
        errors
      )}`
    );
  })
);

const aNodoAttivaRPTInvalidNM3 = pipe(
  esitoNodoVerificaRPTRisposta_type_ppt.decode({
    esito: "KO",
    fault:{ 
      faultCode: "PPT_MULTI_BENEFICIARIO",
      faultString: "Pagamento nm3", 
      id: "PPT_MULTI_BENEFICIARIO" 
    }
    }),
  E.getOrElseW(errors => {
    throw Error(
      `Invalid esitoNodoVerificaRPTRisposta_type_ppt to decode: ${reporters.readableReport(
        errors
      )}`
    );
  })
);

export class FakePagamentiTelematiciPspNodoAsyncClient extends PPTPortClient.PagamentiTelematiciPspNodoAsyncClient {
  constructor(client: IPPTPortSoap, timeout: number) {
    super(client, timeout);
  }
  public readonly nodoVerificaRPT = (input: nodoVerificaRPT_element_ppt) => {
    return new Promise<nodoVerificaRPTRisposta_element_ppt>((resolve, reject) => {
      const iuv = input.codiceIdRPT["qrc:QrCode"]["qrc:CodIUV"];
      if ( iuv.endsWith(endTimeoutIuvInvalidResponse) ) {
        reject(timeoutResponse);
      } else if (iuv.endsWith(endIuvInvalidResponse)) {
        reject(invalidResponse);
      } else if (iuv.endsWith(endKoWithoudDetailsInvalidResponse)) {
        resolve({
          nodoVerificaRPTRisposta: koWithouDetailsResponse
        });
      } else if (iuv.endsWith(endKoPagamentoInCorsoInvalidResponse)) {
        resolve({
          nodoVerificaRPTRisposta: aNodoVerificaRPTRispostaPagamentoInCorso
        });
      } else if (iuv.endsWith(endNM3Response) || iuv.endsWith(endNM3timeoutResponse) || iuv.endsWith(endNM3PagamentoInCorsoResponse)) {
        resolve({
          nodoVerificaRPTRisposta: aNodoVerificaRPTNM3
        });
      } else if (iuv.endsWith(endNM3InvalidResponse)) {
        resolve({
          nodoVerificaRPTRisposta: aNodoVerificaRPTInvalidNM3
        });
      }
      else if (input !== undefined) {
        resolve({
          nodoVerificaRPTRisposta: aNodoVerificaRPTRispostaOK
        });
      } else {
        reject(invalidInput);
      }
    });
  };

  public readonly nodoAttivaRPT = (input: nodoAttivaRPT_element_ppt) => {
    return new Promise<nodoAttivaRPTRisposta_element_ppt>((resolve, reject) => {
      const iuv = input.codiceIdRPT["qrc:QrCode"]["qrc:CodIUV"];
      if ( iuv.endsWith(endTimeoutIuvInvalidResponse) ) {
        reject(timeoutResponse);
      } else if (iuv.endsWith(endIuvInvalidResponse)) {
        reject(invalidResponse);
      } else if (iuv.endsWith(endKoWithoudDetailsInvalidResponse)) {
        resolve({
          nodoAttivaRPTRisposta: koWithouDetailsResponse
        });
      } else if (iuv.endsWith(endKoPagamentoInCorsoInvalidResponse)) {
        resolve({
          nodoAttivaRPTRisposta: aNodoAttivaRPTRispostaPagamentoInCorso
        });
      } else if (iuv.endsWith(endNM3Response) || iuv.endsWith(endNM3timeoutResponse) || iuv.endsWith(endNM3PagamentoInCorsoResponse)) {
        resolve({
          nodoAttivaRPTRisposta: aNodoAttivaRPTNM3
        });
      } else if (iuv.endsWith(endNM3InvalidResponse)) {
        resolve({
          nodoAttivaRPTRisposta: aNodoAttivaRPTInvalidNM3
        });
      } else if (input !== undefined) {
        resolve({
          nodoAttivaRPTRisposta: aNodoAttivaRPTRispostaOK
        });
      } else {
        reject(invalidInput);
      }
    });
  };
}
