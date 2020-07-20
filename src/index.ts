/**
 * Create and Run the server
 */

import * as appInsights from "applicationinsights";

import { fromNullable } from "fp-ts/lib/Option";
import { reporters } from "italia-ts-commons";
import * as App from "./App";
import { CONFIG, Configuration } from "./Configuration";
import { logger } from "./utils/Logger";

// Retrieve server configuration
const config = Configuration.decode(CONFIG).getOrElseL(errors => {
  throw Error(`Invalid configuration: ${reporters.readableReport(errors)}`);
});

// Initialize AppInsights if InstrumentationKey is provided
fromNullable(process.env.APPINSIGHTS_INSTRUMENTATIONKEY).map(k => {
  // see https://github.com/projectkudu/kudu/wiki/Azure-runtime-environment#website-environment-variables
  const aiCloudRole = process.env.WEBSITE_SITE_NAME || "pagopa-proxy";
  logger.verbose(
    `Starting application insights agent - cloudRole[${aiCloudRole}]`
  );

  appInsights
    .setup(k)
    // do not buffer request data on disk
    .setUseDiskRetryCaching(false);

  // tslint:disable-next-line: no-object-mutation
  appInsights.defaultClient.context.tags[
    appInsights.defaultClient.context.keys.cloudRole
  ] = aiCloudRole;

  appInsights.start();
});

// Define and start server
App.startApp(config).catch(error => {
  logger.error(`Error occurred starting server: ${error}`);
});
