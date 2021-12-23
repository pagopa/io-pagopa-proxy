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

export class FakePagamentiTelematiciPspNodoAsyncClient extends PPTPortClient.PagamentiTelematiciPspNodoAsyncClient {
  constructor(client: IPPTPortSoap) {
    super(client);
  }
  public readonly nodoVerificaRPT = (input: nodoVerificaRPT_element_ppt) => {
    return new Promise<nodoVerificaRPTRisposta_element_ppt>((resolve, reject) => {
      if (input !== undefined) {
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
      if (input !== undefined) {
        resolve({
          nodoAttivaRPTRisposta: aNodoAttivaRPTRispostaOK
        });
      } else {
        reject(invalidInput);
      }
    });
  };
}
