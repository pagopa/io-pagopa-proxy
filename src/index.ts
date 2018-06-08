/**
 * Create and Run the server
 */

import { reporters } from "italia-ts-commons";
import * as App from "./App";
import { CONFIG, Configuration } from "./Configuration";

const config = Configuration.decode(CONFIG).getOrElseL(errors => {
  throw new Error(`Invalid configuration: ${reporters.readableReport(errors)}`);
});
App.startApp(config);
