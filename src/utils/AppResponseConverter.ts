/**
 * Response Converter
 * Define utils to convert data from PagoPaAPI interfaces to controller interfaces and viceversa
 */

import {
  LoginAnonymousResponse,
  LoginResponse
} from "../api/types/LoginResponse";
import {
  AckResult,
  NotificationSubscriptionResponse
} from "../api/types/NotificationSubscriptionResponse";
import { TransactionListResponse } from "../api/types/TransactionResponse";
import { WalletResponse } from "../api/types/WalletResponse";
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
  ): LoginResponseApp | Error {
    if (loginResponse.apiRequestToken === undefined) {
      return new Error(ControllerError.ERROR_LOGIN_FAILED);
    }
    return {
      token: loginResponse.apiRequestToken
    };
  }

  public static getLoginAnonymusFromAPIResponse(
    loginAnonymousResponse: LoginAnonymousResponse
  ): LoginAnonymousResponseApp | Error {
    if (
      loginAnonymousResponse.apiRequestToken === undefined ||
      loginAnonymousResponse.apiRequestToken === ""
    ) {
      return new Error(ControllerError.ERROR_LOGIN_FAILED);
    }
    return {
      token: loginAnonymousResponse.apiRequestToken,
      type: loginAnonymousResponse.approveTerms.type,
      title: loginAnonymousResponse.approveTerms.title,
      privacy: loginAnonymousResponse.approveTerms.properties.privacy,
      terms: loginAnonymousResponse.approveTerms.properties.terms
    };
  }

  public static getWalletFromAPIResponse(
    walletResponse: WalletResponse
  ): WalletResponseApp | Error {
    if (walletResponse.data === undefined) {
      return new Error(ControllerError.ERROR_DATA_NOT_FOUND);
    }
    const paymentMethodList: PaymentMethodApp[] = []; // tslint:disable-line
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
    transactionListResponse: TransactionListResponse
  ): TransactionListResponseApp | Error {
    if (transactionListResponse.data === undefined) {
      return new Error(ControllerError.ERROR_DATA_NOT_FOUND);
    }
    const transactionList: TransactionApp[] = []; // tslint:disable-line
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
    notificationSubscriptionResponse: NotificationSubscriptionResponse
  ): NotificationSubscriptionResponseApp | Error {
    if (notificationSubscriptionResponse.result !== AckResult.keys.OK) {
      return new Error(ControllerError.REQUEST_REJECTED);
    }
    return {
      result: true
    };
  }
}
