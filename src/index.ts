/**
 * Create and Run the server
 */

import * as appInsights from "applicationinsights";

import { reporters } from "italia-ts-commons";
import * as App from "./App";
import { CONFIG, Configuration } from "./Configuration";
import { logger } from "./utils/Logger";

// Retrieve server configuration
const config = Configuration.decode(CONFIG).getOrElseL(errors => {
  throw Error(`Invalid configuration: ${reporters.readableReport(errors)}`);
});

logger.verbose("Starting application insights agent");
appInsights.setup().setUseDiskRetryCaching(false); // do not buffer request data on disk

appInsights.start();

// Define and start server
App.startApp(config).catch(error => {
  logger.error(`Error occurred starting server: ${error}`);
});
