import { reporters } from "italia-ts-commons";
import * as soap from "soap";
import * as PPTPortClient from "../../services/pagopa_api/PPTPortClient";
import { IPPTPortSoap } from "../../types/pagopa_api/IPPTPortSoap";
import { esitoNodoAttivaRPTRisposta_ppt } from "../../types/pagopa_api/yaml-to-ts/esitoNodoAttivaRPTRisposta_ppt";
import { esitoNodoVerificaRPTRisposta_ppt } from "../../types/pagopa_api/yaml-to-ts/esitoNodoVerificaRPTRisposta_ppt";
import { nodoAttivaRPT_ppt } from "../../types/pagopa_api/yaml-to-ts/nodoAttivaRPT_ppt";
import { nodoAttivaRPTRisposta_ppt } from "../../types/pagopa_api/yaml-to-ts/nodoAttivaRPTRisposta_ppt";
import { nodoVerificaRPT_ppt } from "../../types/pagopa_api/yaml-to-ts/nodoVerificaRPT_ppt";
import { nodoVerificaRPTRisposta_ppt } from "../../types/pagopa_api/yaml-to-ts/nodoVerificaRPTRisposta_ppt";
import { createClient } from "../../utils/SoapUtils";

export async function createPagamentiTelematiciPspNodoClient(
  options: soap.IOptions
): Promise<soap.Client & IPPTPortSoap> {
  return createClient<IPPTPortSoap>(
    PPTPortClient.PAGAMENTI_TELEMATICI_PSP_WSDL_PATH,
    options
  );
}

const aNodoVerificaRPTRispostaOK = esitoNodoVerificaRPTRisposta_ppt
  .decode({
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
  })
  .getOrElseL(errors => {
    throw Error(
      `Invalid esitoNodoVerificaRPTRisposta_ppt to decode: ${reporters.readableReport(
        errors
      )}`
    );
  });

const aNodoAttivaRPTRispostaOK = esitoNodoAttivaRPTRisposta_ppt
  .decode({
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
  })
  .getOrElseL(errors => {
    throw Error(
      `Invalid esitoNodoAttivaRPTRisposta_ppt to decode: ${reporters.readableReport(
        errors
      )}`
    );
  });

export class FakePagamentiTelematiciPspNodoAsyncClient extends PPTPortClient.PagamentiTelematiciPspNodoAsyncClient {
  constructor(client: IPPTPortSoap) {
    super(client);
  }
  public readonly nodoVerificaRPT = (input: nodoVerificaRPT_ppt) => {
    return new Promise<nodoVerificaRPTRisposta_ppt>((resolve, reject) => {
      if (input !== undefined) {
        resolve({
          nodoVerificaRPTRisposta: aNodoVerificaRPTRispostaOK
        });
      } else {
        reject("Invalid input");
      }
    });
  };

  public readonly nodoAttivaRPT = (input: nodoAttivaRPT_ppt) => {
    return new Promise<nodoAttivaRPTRisposta_ppt>((resolve, reject) => {
      if (input !== undefined) {
        resolve({
          nodoAttivaRPTRisposta: aNodoAttivaRPTRispostaOK
        });
      } else {
        reject("Invalid input");
      }
    });
  };
}
