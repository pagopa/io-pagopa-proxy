import * as t from "io-ts";
import { initAppInsights } from "@pagopa/ts-commons/lib/appinsights";
import { IntegerFromString } from "@pagopa/ts-commons/lib/numbers";
import { pipe } from "fp-ts/lib/function";
import * as E from "fp-ts/lib/Either";
import { CONFIG } from "../Configuration";

const PaymentEvent = t.interface({
  name: t.string,
  properties: t.partial({
    clientId: t.string,
    codiceContestoPagamento: t.string,
    detail: t.string,
    detail_v2: t.string,
    result: t.string,
    rptId: t.string
  })
});

export type PaymentEvent = t.TypeOf<typeof PaymentEvent>;

export enum EventNameEnum {
  "PAYMENT_VERIFY" = "PAYMENT_VERIFY",
  "PAYMENT_ACTIVATION" = "PAYMENT_ACTIVATION",
  "CDINFO_COMPLETE" = "CDINFO_COMPLETE",
  "REDIS_ERROR" = "REDIS_ERROR"
}

export enum EventResultEnum {
  "OK" = "OK",
  "INVALID_INPUT" = "INVALID_INPUT",
  "CONNECTION_NODE" = "CONNECTION_NOD",
  "REDIS_CONNECTION_ERR" = "REDIS_CONNECTION_ERR",
  "REDIS_CONNECTION_WRN" = "REDIS_CONNECTION_WRN",
  "REDIS_CONNECTION_LOST" = "REDIS_CONNECTION_LOST",
  "REDIS_TRY_RECONNECT" = "REDIS_TRY_RECONNECT",
  "ERROR_NODE" = "ERROR_NODE"
}

// the internal function runtime has MaxTelemetryItem per second set to 20 by default
// @see https://github.com/Azure/azure-functions-host/blob/master/src/WebJobs.Script/Config/ApplicationInsightsLoggerOptionsSetup.cs#L29
const DEFAULT_SAMPLING_PERCENTAGE = 20;

// Avoid to initialize Application Insights more than once
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const initTelemetryClient = (
  intrumentationKey: string,
  aiDisable: string,
  aiSampling: string
) =>
  initAppInsights(intrumentationKey, {
    disableAppInsights: aiDisable === "true",
    samplingPercentage: pipe(
      IntegerFromString.decode(aiSampling),
      E.getOrElse(_ => DEFAULT_SAMPLING_PERCENTAGE)
    )
  });

const telemetryClient = initTelemetryClient(
  CONFIG.APPINSIGHTS_INSTRUMENTATIONKEY,
  CONFIG.APPINSIGHTS_DISABLE,
  CONFIG.APPINSIGHTS_SAMPLING_PERCENTAGE
);

export const trackPaymentEvent = (event: PaymentEvent): void =>
  telemetryClient.trackEvent({
    name: event.name,
    properties: event.properties,
    tagOverrides: { samplingEnabled: "false" }
  });
