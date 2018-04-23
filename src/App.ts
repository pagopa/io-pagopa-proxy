/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 *
 */

import * as bodyParser from "body-parser";
import * as express from "express";
import * as morgan from "morgan";

import { UserController } from "./controllers/UserController";
import { ICreditCard } from "./types/CreditCard";
import { IPaymentMethod } from "./types/PaymentMethod";

const VERSION: string = "0.0.11";

class App {
    public readonly express: express.Application = express();
    private readonly testMode?: boolean = false;

    constructor(testMode?: boolean) {
        this.middleware();
        this.routes();
        this.testMode = testMode;
    }

    private middleware(): void {
        if (!this.testMode) {
            this.express.use(morgan("combined"));
        }
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false }));
    }

    private getUserAndThen<T, S = {}>(
        req: express.Request,
        res: express.Response,
        andThen: ((user: UserController, args: S | undefined) => T | undefined),
        args?: S
    ): T | undefined {
        try {
            const token = req.query.token;
            const user = new UserController(token);
            return andThen(user, args);
        } catch (err) {
            // TODO: define what status code to return
            res.json({
                status: "ERROR",
                message: err.message
            });
        }
        return;
    }

    private routes(): void {
        const router = express.Router();

        router.get("/", (_, res) => {
            res.json({
                message: "Welcome to AwesomePAPI!",
                version: VERSION
            });
        });

        router.get("/getCreditCards", (_, res) => {
            res.json();
        });

        router.get("/wallet", (req, res) => {
            const wallet:
                | ReadonlyArray<IPaymentMethod>
                | undefined = this.getUserAndThen<
                ReadonlyArray<IPaymentMethod>
            >(req, res, (user: UserController) => user.getWallet());
            if (wallet !== undefined) {
                res.json({
                    status: "OK",
                    wallet: wallet
                });
            }
        });

        router.get("/cards", (req, res) => {
            const cards:
                | ReadonlyArray<ICreditCard>
                | undefined = this.getUserAndThen<ReadonlyArray<ICreditCard>>(
                req,
                res,
                (user: UserController) => user.getCreditCards()
            );
            if (cards !== undefined) {
                res.json({
                    status: "OK",
                    credit_cards: cards
                });
            }
        });

        router.get("/cards/:cardid", (req, res) => {
            const card: ICreditCard | undefined = this.getUserAndThen<
                ICreditCard
            >(req, res, (user: UserController) =>
                user.getCreditCard(req.params.cardid)
            );
            if (card !== undefined) {
                res.json({
                    status: "OK",
                    credit_card: card
                });
            }
        });

        this.express.use("/", router);
    }
}

export default App;
