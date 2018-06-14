/**
 * Create and Run the server
 */

import { reporters } from "italia-ts-commons";
import * as App from "./App";
import { CONFIG, Configuration } from "./Configuration";
import { logger } from "./utils/Logger";

const config = Configuration.decode(CONFIG).getOrElseL(errors => {
  throw Error(`Invalid configuration: ${reporters.readableReport(errors)}`);
});

App.startApp(config)
  .then()
  .catch(error => {
    logger.error(
      `Error occurred starting server: ${reporters.readableReport(error)}`
    );
  });
