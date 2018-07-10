//tslint:disable
import { PagamentiTelematiciPspNodoAsyncClient } from "italia-pagopa-api/dist/clients/PPTPortClient";
import { createClient } from "italia-pagopa-api/dist/utils/SoapUtils";
import * as ApiConfiguration from "italia-pagopa-api/dist/Configuration";
import { IPPTPortSoap } from "italia-pagopa-api/dist/types/IPPTPortSoap";
import * as soap from "soap";
import { nodoVerificaRPT_ppt } from "italia-pagopa-api/dist/types/yaml-to-ts/nodoVerificaRPT_ppt";
import { nodoVerificaRPTRisposta_ppt } from "italia-pagopa-api/dist/types/yaml-to-ts/nodoVerificaRPTRisposta_ppt";
import { nodoAttivaRPT_ppt } from "italia-pagopa-api/dist/types/yaml-to-ts/nodoAttivaRPT_ppt";
import { nodoAttivaRPTRisposta_ppt } from "italia-pagopa-api/dist/types/yaml-to-ts/nodoAttivaRPTRisposta_ppt";

export async function createPagamentiTelematiciPspNodoClient(
  options: soap.IOptions
): Promise<soap.Client & IPPTPortSoap> {
  return createClient<IPPTPortSoap>(
    ApiConfiguration.PAGAMENTI_TELEMATICI_WSDL_PATH,
    options
  );
}

export class FakePagamentiTelematiciPspNodoAsyncClient extends PagamentiTelematiciPspNodoAsyncClient {
  constructor(client: IPPTPortSoap) {
    super(client);
  }
  public readonly nodoVerificaRPT = (
    input: nodoVerificaRPT_ppt
  ) => {
    return new Promise<
      nodoVerificaRPTRisposta_ppt
    >((resolve, reject) => {
      if (input !== undefined) {
        resolve({
          nodoVerificaRPTRisposta : {
          fault: {
            faultCode: "01",
            faultString: "FAULTSTRING",
            id: "ID01",
            description: "FAULTDESCRIPTION",
            serial: 1
          },
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
            causaleVersamento: "CAUSALE01",
            spezzoniCausaleVersamento: [
              {
                spezzoneCausaleVersamento: "SPEZZONE1",
                spezzoneStrutturatoCausaleVersamento: {
                  causaleSpezzone: "CAUSALE01",
                  importoSpezzone: 99.05
                }
              }
            ]
          }
        }
        });
      } else {
        reject("Invalid input");
      }
    });
  };

  public readonly nodoAttivaRPT = (
    input: nodoAttivaRPT_ppt
  ) => {
    return new Promise<nodoAttivaRPTRisposta_ppt>(
      (resolve, reject) => {
        if (input !== undefined) {
          resolve({
            nodoAttivaRPTRisposta: {
            fault: {
              faultCode: "01",
              faultString: "FAULTSTRING",
              id: "ID01",
              description: "FAULTDESCRIPTION",
              serial: 1
            },
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
              causaleVersamento: "CAUSALE01",
              spezzoniCausaleVersamento: [
                {
                  spezzoneCausaleVersamento: "SPEZZONE1",
                  spezzoneStrutturatoCausaleVersamento: {
                    causaleSpezzone: "CAUSALE01",
                    importoSpezzone: 99.05
                  }
                }
              ]
            }
          }
          });
        } else {
          reject("Invaild input");
        }
      }
    );
  };
}
