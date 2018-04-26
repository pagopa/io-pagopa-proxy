/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 *
 */

import * as express from "express";

import { CreditCard } from "../types/CreditCard";
import { PaymentMethodEnum } from "../types/PaymentMethod";
import { StatusCode } from "../types/StatusCode";
import { extractUserFromRequest } from "../types/User";

import * as Mocked from "../MockedData";

interface IStatusObject {
  readonly status: StatusCode;
  readonly message?: string;
}

function genOKStatus(): IStatusObject {
  return { status: StatusCode.OK };
}

function genErrorStatus(err: Error): IStatusObject {
  return { status: StatusCode.ERROR, message: err.message };
}

/**
 * User Controller
 */
export class UserController {
  public getWallet(req: express.Request, res: express.Response): void {
    const errorOrUser = extractUserFromRequest(req);
    if (errorOrUser.isLeft()) {
      const error: Error = errorOrUser.value;
      res.status(500).json(genErrorStatus(error));
    } else {
      res.status(200).json({
        ...genOKStatus(),
        wallet: Mocked.wallet
      });
    }
  }

  public getCreditCards(req: express.Request, res: express.Response): void {
    const errorOrUser = extractUserFromRequest(req);
    if (errorOrUser.isLeft()) {
      const error: Error = errorOrUser.value;
      res.status(500).json(genErrorStatus(error));
    } else {
      res.status(200).json({
        ...genOKStatus(),
        credit_cards: Mocked.wallet
          .filter(method => method.type === PaymentMethodEnum.CREDIT_CARD)
          // tslint:disable-next-line
          .map(card => card as CreditCard)
      });
    }
  }

  public getCreditCard(req: express.Request, res: express.Response): void {
    const errorOrUser = extractUserFromRequest(req);
    if (errorOrUser.isLeft()) {
      const error: Error = errorOrUser.value;
      res.status(500).json(genErrorStatus(error));
    } else {
      const cardOrNot = CreditCard.decode(
        Mocked.wallet.find(
          method =>
            method.id === req.params.cardid &&
            method.type === PaymentMethodEnum.CREDIT_CARD
        )
      );
      if (cardOrNot.isRight()) {
        const card = cardOrNot.value;
        res.status(200).json({
          ...genOKStatus(),
          credit_card: card
        });
      } else {
        res
          .status(500)
          .json(genErrorStatus(new Error("Credit card not found")));
      }
    }
  }

  // TODO: implement getTransactions(paymentMethod) and getLatestTransactions(from, limit)
}
