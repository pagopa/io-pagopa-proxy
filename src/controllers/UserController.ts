/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 */

import * as express from "express";
import * as Mocked from "../MockedData";
import { CreditCard } from "../types/CreditCard";
import { PaymentMethodEnum } from "../types/PaymentMethod";
import { extractUserFromRequest } from "../types/User";
import { ControllerUtils } from "../utils/ControllerUtils";

// User Controller
export class UserController {
  public getWallets(req: express.Request, res: express.Response): void {
    const errorOrUser = extractUserFromRequest(req);
    if (errorOrUser.isLeft()) {
      ControllerUtils.setErrorResponse(res, errorOrUser.value);
    } else {
      ControllerUtils.setSuccessResponse(res, { wallet: Mocked.wallet });
    }
  }

  public getCreditCards(req: express.Request, res: express.Response): void {
    const errorOrUser = extractUserFromRequest(req);
    if (errorOrUser.isLeft()) {
      ControllerUtils.setErrorResponse(res, errorOrUser.value);
    } else {
      if (req.params.cardId === undefined) {
        ControllerUtils.setSuccessResponse(res, {
          credit_cards: Mocked.wallet
            .filter(method => method.type === PaymentMethodEnum.CREDIT_CARD)
            // tslint:disable-next-line
            .map(card => card as CreditCard)
        });

        // CASE 2: CardId specified
      } else {
        const cardOrNot = CreditCard.decode(
          Mocked.wallet.find(
            method =>
              method.id === req.params.cardId &&
              method.type === PaymentMethodEnum.CREDIT_CARD
          )
        );
        if (cardOrNot.isRight()) {
          ControllerUtils.setSuccessResponse(res, {
            credit_card: cardOrNot.value
          });
        } else {
          ControllerUtils.setErrorResponse(
            res,
            new Error("Credit card not found")
          );
        }
      }
    }
  }
}
