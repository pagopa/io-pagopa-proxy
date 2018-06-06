import { PagoPaConfig } from "../Configuration";
import {
  CORRECT_PAYMENT_CHECK_REQUEST,
  PAGOPA_CONFIG,
  VALID_CODICE_CONTESTO_PAGAMENTO
} from "../mocks/MockedData";
import { PaymentsCheckRequest } from "../types/controllers/PaymentsCheckRequest";
import { CodiceContestoPagamento } from "../types/PagoPaTypes";
import * as paymentConverter from "../utils/PaymentsConverter";

describe("Payment Converter", () => {
  test("Payment converter should return a correct nodoAttivaRPT", () => {
    const PAYMENT_CHECK_REQUEST = CORRECT_PAYMENT_CHECK_REQUEST;

    const CODICE_CONTESTO_PAGAMENTO = VALID_CODICE_CONTESTO_PAGAMENTO;

    const paymentsCheckRequestPagopa = paymentConverter.getPaymentsCheckRequestPagoPa(
      PAGOPA_CONFIG as PagoPaConfig,
      PAYMENT_CHECK_REQUEST as PaymentsCheckRequest,
      CODICE_CONTESTO_PAGAMENTO as CodiceContestoPagamento
    );

    console.log(paymentsCheckRequestPagopa);
    expect(paymentsCheckRequestPagopa).toBeDefined();
    expect(paymentsCheckRequestPagopa.isRight()).toBeTruthy();
  });
});
