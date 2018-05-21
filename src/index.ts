/**
 * Create and Run the server
 */

import { App } from "./App";
import { MockedProxyAPIApp } from "./mocks/MockedProxyAPIApp";

MockedProxyAPIApp.startApp();
App.startApp();
