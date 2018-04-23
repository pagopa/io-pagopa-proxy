/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 *
 *
 */
import * as debug from "debug";
import * as http from "http";

import App from "./App";

debug("ts-express:server");

const port = normalizePort(process.env.PORT || 3000);
const app = new App().express;

app.set("port", port);

const server = http.createServer(app);
server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

function normalizePort(val: number | string): number | string | boolean
{
    const xport: number = typeof val === "string" ? parseInt(val, 10) : val;
    if (isNaN(xport))
    {
        return val;
    }
    else if (xport >= 0)
    {
        return xport;
    }
    else
    {
        return false;
    }
}

function onError(error: NodeJS.ErrnoException): void
{
    if (error.syscall !== "listen")
    {
        throw error;
    }
    const stringPort = String(port);
    const bind = typeof port === "string" ? "Pipe " +
        stringPort : "Port " + stringPort;
    switch (error.code)
    {
        case "EACCES":
            console.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case "EADDRINUSE":
            console.error(`${bind} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function onListening(): void
{
    const addr = server.address();
    const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;
    debug(`Listening on ${bind}`);
}
