/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 */

import { App } from "./App";
import { MockedProxyAPIApp } from "./tests/mocks/MockedProxyAPIApp";

new MockedProxyAPIApp().startServer();
new App().startServer();
