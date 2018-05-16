/**
 * Response Converter
 * Define utils to convert data from PagoPaAPI interfaces to controller interfaces and viceversa
 */

import { Either, Left, Right } from "fp-ts/lib/Either";
import { AckResult } from "../api/types/BaseResponse";
import {
  LoginAnonymousResponse,
  LoginResponse
} from "../api/types/LoginResponse";
import { NotificationSubscriptionResponse } from "../api/types/NotificationSubscriptionResponse";
import {
  Transaction,
  TransactionListResponse
} from "../api/types/TransactionResponse";
import { PaymentMethod, WalletResponse } from "../api/types/WalletResponse";
import { ControllerError } from "../enums/ControllerError";
import {
  LoginAnonymousResponseApp,
  LoginResponseApp
} from "../types/LoginResponseApp";
import { NotificationSubscriptionResponseApp } from "../types/NotificationSubscriptionResponseApp";
import {
  TransactionApp,
  TransactionListResponseApp
} from "../types/TransactionResponseApp";
import {
  PaymentMethodApp,
  WalletResponseApp
} from "../types/WalletResponseApp";

// Data converter for controllers to translate API responses to Controller responses
export class AppResponseConverter {
  public static getLoginFromAPIResponse(
    loginResponse: LoginResponse
  ): Either<ControllerError, LoginResponseApp> {
    if (loginResponse.apiRequestToken === undefined) {
      return new Left(ControllerError.ERROR_LOGIN_FAILED);
    }
    return new Right({ token: loginResponse.apiRequestToken });
  }

  public static getLoginAnonymusFromAPIResponse(
    loginAnonymousResponse: LoginAnonymousResponse
  ): Either<ControllerError, LoginAnonymousResponseApp> {
    if (
      loginAnonymousResponse.apiRequestToken === undefined ||
      loginAnonymousResponse.apiRequestToken === ""
    ) {
      return new Left(ControllerError.ERROR_LOGIN_FAILED);
    }
    return new Right({
      token: loginAnonymousResponse.apiRequestToken,
      type: loginAnonymousResponse.approveTerms.type,
      title: loginAnonymousResponse.approveTerms.title,
      privacy: loginAnonymousResponse.approveTerms.properties.privacy,
      terms: loginAnonymousResponse.approveTerms.properties.terms
    });
  }

  public static getWalletFromAPIResponse(
    walletResponse: WalletResponse
  ): Either<ControllerError, WalletResponseApp> {
    if (walletResponse.data === undefined) {
      return new Left(ControllerError.ERROR_DATA_NOT_FOUND);
    }

    return new Right({
      wallet: walletResponse.data.map(
        (paymentMethod: PaymentMethod): PaymentMethodApp => {
          return {
            idWallet: paymentMethod.idWallet,
            type: paymentMethod.type,
            favourite: paymentMethod.favourite,
            lastUsage: paymentMethod.lastUsage,
            pspBusinessName: paymentMethod.psp.businessName,
            pspServiceName: paymentMethod.psp.serviceName,
            cardPan:
              paymentMethod.creditCard === undefined
                ? undefined
                : paymentMethod.creditCard.pan
          };
        }
      )
    });
  }

  public static getTransactionListFromAPIResponse(
    transactionListResponse: TransactionListResponse
  ): Either<ControllerError, TransactionListResponseApp> {
    if (transactionListResponse.data === undefined) {
      return new Left(ControllerError.ERROR_DATA_NOT_FOUND);
    }

    return new Right({
      total: transactionListResponse.total,
      size: transactionListResponse.size,
      start: transactionListResponse.start,
      transactions: transactionListResponse.data.map(
        (transaction: Transaction): TransactionApp => {
          return {
            id: transaction.id,
            created: transaction.created,
            statusMessage: transaction.statusMessage,
            error: transaction.error,
            currency: transaction.amount.currency,
            amount: transaction.amount.amount,
            amountDecimalDigit: transaction.amount.decimalDigits,
            merchant: transaction.merchant
          };
        }
      )
    });
  }

  public static getNotificationSubscriptionResponseFromAPIResponse(
    notificationSubscriptionResponse: NotificationSubscriptionResponse
  ): Either<ControllerError, NotificationSubscriptionResponseApp> {
    if (notificationSubscriptionResponse.result !== AckResult.keys.OK) {
      return new Left(ControllerError.REQUEST_REJECTED);
    }
    return new Right({
      result: true
    });
  }
}
