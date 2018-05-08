/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 */

import { NonEmptyString } from "italia-ts-commons/lib/strings";
import {
  ILoginAnonymousResponse,
  ILoginResponse
} from "../api/types/LoginResponse";
import { ITransactionListResponse } from "../api/types/TransactionResponse";
import { IWalletResponse } from "../api/types/WalletResponse";
import {
  ILoginAnonymousResponseApp,
  ILoginResponseApp
} from "../types/LoginResponseApp";
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
  ): ILoginResponseApp {
    return {
      token: loginResponse.apiRequestToken
    };
  }

  public static getLoginAnonymusFromAPIResponse(
    loginAnonymousResponse: ILoginAnonymousResponse
  ): ILoginAnonymousResponseApp {
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
  ): IWalletResponseApp {
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
  ): ITransactionListResponseApp {
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
}
