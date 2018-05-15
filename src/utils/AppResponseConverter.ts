/**
 * Response Converter
 * Define utils to convert data from PagoPaAPI interfaces to controller interfaces and viceversa
 */

import { NonEmptyString } from "italia-ts-commons/lib/strings";
import {
  ILoginAnonymousResponse,
  ILoginResponse
} from "../api/types/LoginResponse";
import {
  AckResult,
  INotificationSubscriptionResponse
} from "../api/types/NotificationSubscriptionResponse";
import { ITransactionListResponse } from "../api/types/TransactionResponse";
import { IWalletResponse } from "../api/types/WalletResponse";
import { ControllerError } from "../enums/ControllerError";
import {
  ILoginAnonymousResponseApp,
  ILoginResponseApp
} from "../types/LoginResponseApp";
import { INotificationSubscriptionResponseApp } from "../types/NotificationSubscriptionResponseApp";
import {
  ITransactionApp,
  ITransactionListResponseApp
} from "../types/TransactionResponseApp";
import {
  IPaymentMethodApp,
  IWalletResponseApp
} from "../types/WalletResponseApp";

// Data converter for controllers to translate API responses to Controller responses
export class AppResponseConverter {
  public static getLoginFromAPIResponse(
    loginResponse: ILoginResponse
  ): ILoginResponseApp | Error {
    if (loginResponse.apiRequestToken === undefined) {
      return new Error(ControllerError.ERROR_LOGIN_FAILED);
    }
    return {
      token: loginResponse.apiRequestToken
    };
  }

  public static getLoginAnonymusFromAPIResponse(
    loginAnonymousResponse: ILoginAnonymousResponse
  ): ILoginAnonymousResponseApp | Error {
    if (
      loginAnonymousResponse.apiRequestToken === undefined ||
      loginAnonymousResponse.apiRequestToken === ""
    ) {
      return new Error(ControllerError.ERROR_LOGIN_FAILED);
    }
    return {
      token: loginAnonymousResponse.apiRequestToken as NonEmptyString,
      type: loginAnonymousResponse.approveTerms.type,
      title: loginAnonymousResponse.approveTerms.title,
      privacy: loginAnonymousResponse.approveTerms.properties.privacy,
      terms: loginAnonymousResponse.approveTerms.properties.terms
    };
  }

  public static getWalletFromAPIResponse(
    walletResponse: IWalletResponse
  ): IWalletResponseApp | Error {
    if (walletResponse.data === undefined) {
      return new Error(ControllerError.ERROR_DATA_NOT_FOUND);
    }
    const paymentMethodList: IPaymentMethodApp[] = []; // tslint:disable-line
    for (const wallet of walletResponse.data) {
      paymentMethodList.push({
        idWallet: wallet.idWallet,
        type: wallet.type,
        favourite: wallet.favourite,
        lastUsage: wallet.lastUsage,
        pspBusinessName: wallet.psp.businessName,
        pspServiceName: wallet.psp.serviceName,
        cardPan:
          wallet.creditCard === undefined ? undefined : wallet.creditCard.pan
      });
    }
    return {
      wallet: paymentMethodList
    };
  }

  public static getTransactionListFromAPIResponse(
    transactionListResponse: ITransactionListResponse
  ): ITransactionListResponseApp | Error {
    if (transactionListResponse.data === undefined) {
      return new Error(ControllerError.ERROR_DATA_NOT_FOUND);
    }
    const transactionList: ITransactionApp[] = []; // tslint:disable-line
    for (const transaction of transactionListResponse.data) {
      transactionList.push({
        id: transaction.id,
        created: transaction.created,
        statusMessage: transaction.statusMessage,
        error: transaction.error,
        currency: transaction.amount.currency,
        amount: transaction.amount.amount,
        amountDecimalDigit: transaction.amount.decimalDigits,
        merchant: transaction.merchant
      });
    }
    return {
      total: transactionListResponse.total,
      size: transactionListResponse.size,
      start: transactionListResponse.start,
      transactions: transactionList
    };
  }

  public static getNotificationSubscriptionResponseFromAPIResponse(
    notificationSubscriptionResponse: INotificationSubscriptionResponse
  ): INotificationSubscriptionResponseApp | Error {
    if (notificationSubscriptionResponse.result !== AckResult.OK) {
      return new Error(ControllerError.REQUEST_REJECTED);
    }
    return {
      result: true
    };
  }
}
