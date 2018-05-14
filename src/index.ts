/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 */

import { App } from "./App";
import { MockedProxyAPIApp } from "./mocks/MockedProxyAPIApp";

new MockedProxyAPIApp().startServer();
new App().startServer();
