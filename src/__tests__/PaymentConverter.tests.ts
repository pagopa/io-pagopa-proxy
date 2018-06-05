import {
  CORRECT_PAYMENT_CHECK_REQUEST,
  PAGOPA_CONFIG,
  VALID_CODICE_CONTESTO_PAGAMENTO
} from "../mocks/MockedData";
import * as paymentConverter from "../utils/PaymentsConverter";

describe("Payment Converter", () => {
  test("Payment converter should return a correct nodoAttivaRPT", () => {
    const PAYMENT_CHECK_REQUEST = CORRECT_PAYMENT_CHECK_REQUEST;
    const CODICE_CONTESTO_PAGAMENTO = VALID_CODICE_CONTESTO_PAGAMENTO;
    if (
      PAYMENT_CHECK_REQUEST.isRight() &&
      CODICE_CONTESTO_PAGAMENTO.isRight() &&
      PAGOPA_CONFIG.isRight()
    ) {
      expect(
        paymentConverter.getPaymentsCheckRequestPagoPa(
          PAGOPA_CONFIG.value,
          PAYMENT_CHECK_REQUEST.value,
          CODICE_CONTESTO_PAGAMENTO.value
        )
      ).toBeDefined();
    }
  });
});
