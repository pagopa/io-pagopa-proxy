/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 *
 */

import * as bodyParser from "body-parser";
import * as express from "express";
import * as morgan from "morgan";

import { Option, none, some } from "fp-ts/lib/Option";

import { UserController } from "./controllers/UserController";
import { CreditCard } from "./types/CreditCard";
import { PaymentMethod, PaymentMethodType } from "./types/PaymentMethod";
import { IUser } from "./types/User"


const VERSION: string = "0.0.11";
const NAME: string = "italia-pagopa-proxy";

function getUserAndThen<T>(
    req: express.Request,
    res: express.Response,
    andThen: ((userController: UserController) => Option<T>)
): Option<T> {
    try {
        const token = req.query.token;
        const user: IUser = { token };
        const userController = new UserController(user);
        return andThen(userController);
    } catch (err) {
        // TODO: define what status code to return
        res.json({
            status: "ERROR",
            message: err.message
        });
    }
    return none;
}

export function newApp(
    /* TODO: receive env to decide whether to enable ssl */
    testMode: boolean = false
): express.Express {

    const app = express(); // create app

    // setup Express app
    if (!testMode) {
        app.use(morgan("combined"));
    }
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

    // setup routes
    app.get("/", (_, res) => {
        res.json({
            message: `Welcome to ${NAME}!`,
            version: VERSION
        });
    });

    app.get("/getCreditCards", (_, res) => {
        res.json();
    });

    app.get("/wallet", (req, res) => {
        const wallet: Option<ReadonlyArray<PaymentMethod>>
            = getUserAndThen<ReadonlyArray<PaymentMethod>>
                (req, res,
                (user: UserController) => some(user.getWallet()));
        if (wallet.isSome()) {
            res.json({
                status: "OK",
                wallet: wallet.getOrElse([])
            });
        }
    });

    app.get("/cards", (req, res) => {
        const cards: Option<ReadonlyArray<PaymentMethod>>
            = getUserAndThen<ReadonlyArray<CreditCard>>(
                req, res,
                (user: UserController) => some(user.getCreditCards()));
        if (cards.isSome()) {
            res.json({
                status: "OK",
                credit_cards: cards.getOrElse([])
            });
        }
    });

    app.get("/cards/:cardid", (req, res) => {
        const card: Option<CreditCard>
            = getUserAndThen<CreditCard>
                (req, res,
                (user: UserController) => user.getCreditCard(req.params.cardid));
        if (card.isSome()) {
            // TODO: find out whether Option<T> offers a .get() method
            // that either returns "some" or throws an error (i.e. no
            // default value needs to be specified), thus making this
            // dummy card useless
            const dummyCard: CreditCard = {
                id: "3",
                type: PaymentMethodType.decode("CREDIT_CARD").getOrElse(-1),
                issuer: "Mastercard",
                number: "Non ci sono nuove transazioni",
                message: "5412 7556 7890 0000"
            };

            res.json({
                status: "OK",
                credit_card: card.getOrElse(dummyCard)
            });
        }
    });

    return app;
}