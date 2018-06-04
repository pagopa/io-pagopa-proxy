import { Either, Left, Right } from "fp-ts/lib/Either";
import * as uuid from "uuid";
import { ControllerError } from "../../enums/ControllerError";

import { CodiceContestoPagamento } from "../../types/PagoPaTypes";

export function generateCodiceContestoPagamento(): Either<
  Error,
  CodiceContestoPagamento
> {
  const errorOrCodiceContestoPagamento = CodiceContestoPagamento.decode(
    uuid.v1()
  );

  if (errorOrCodiceContestoPagamento.isLeft()) {
    return new Left(new Error(ControllerError.ERROR_INTERNAL));
  }
  return new Right(errorOrCodiceContestoPagamento.value);
}
