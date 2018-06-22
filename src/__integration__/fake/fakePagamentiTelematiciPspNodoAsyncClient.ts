import { clients } from "italia-pagopa-api";
import { createClient } from "italia-pagopa-api/dist/lib/utils";
import { PagamentiTelematiciPspNodoService_WSDL_PATH } from "italia-pagopa-api/dist/lib/wsdl-paths";

import * as PagamentiTelematiciPspNodoService from "italia-pagopa-api/dist/wsdl-lib/PagamentiTelematiciPspNodoservice/PPTPort";
import * as soap from "soap";

export async function createPagamentiTelematiciPspNodoClient(
  options: soap.IOptions
): Promise<soap.Client & PagamentiTelematiciPspNodoService.IPPTPortSoap> {
  return createClient<PagamentiTelematiciPspNodoService.IPPTPortSoap>(
    PagamentiTelematiciPspNodoService_WSDL_PATH,
    options
  );
}

export class FakePagamentiTelematiciPspNodoAsyncClient extends clients.PagamentiTelematiciPspNodoAsyncClient {
  constructor(client: PagamentiTelematiciPspNodoService.IPPTPortSoap) {
    super(client);
  }
  public readonly nodoVerificaRPT = (
    input: PagamentiTelematiciPspNodoService.InodoVerificaRPTInput
  ) => {
    return new Promise<
      PagamentiTelematiciPspNodoService.InodoVerificaRPTOutput
    >((resolve, reject) => {
      if (input !== undefined) {
        resolve({
          nodoVerificaRPTRisposta: {
            fault: {
              faultCode: "01",
              faultString: "FAULTSTRING",
              id: "ID01",
              description: "FAULTDESCRIPTION",
              serial: 1
            },
            esito: PagamentiTelematiciPspNodoService.PPTPortTypes.Esito.OK,
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
    });
  };

  public readonly nodoAttivaRPT = (
    input: PagamentiTelematiciPspNodoService.InodoAttivaRPTInput
  ) => {
    return new Promise<PagamentiTelematiciPspNodoService.InodoAttivaRPTOutput>(
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
              esito: PagamentiTelematiciPspNodoService.PPTPortTypes.Esito.OK,
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
