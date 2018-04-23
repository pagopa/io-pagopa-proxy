/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 *
 */

import * as bodyParser from "body-parser";
import * as express from "express";
import * as logger from "morgan";
import * as morgan from "morgan";

const VERSION: string = "0.0.10";

class App
{
    public readonly express: express.Application = express();
    private readonly testMode?: boolean = false;

    constructor(testMode?: boolean)
    {
        this.middleware();
        this.routes();
        this.testMode = testMode;
    }

    private middleware(): void
    {
        this.express.use(logger("dev"));
        if (!this.testMode)
        {
            this.express.use(morgan("combined"));
        }
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false }));
    }

    private routes(): void
    {
        const router = express.Router();

        router.get("/", (_, res) =>
        {
            res.json({
                message: "Welcome to AwesomePAPI!",
                version: VERSION
            });
        });

        router.get("/getCreditCards", (_, res) =>
        {
            res.json();
        });

        this.express.use("/", router);
    }
}

export default App;
