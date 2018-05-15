/**
 * Create and Run the server
 */

import { App } from "./App";
import { MockedProxyAPIApp } from "./mocks/MockedProxyAPIApp";

new MockedProxyAPIApp().startServer();
new App().startServer();
