/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 */

import * as bodyParser from "body-parser";
import * as express from "express";
import * as morgan from "morgan";
import { CONFIG } from "./configuration";
import { TransactionController } from "./controllers/TransactionController";
import { UserController } from "./controllers/UserController";

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

  const userController = new UserController();
  const transactionController = new TransactionController();

  // setup routes
  app.get("/", (_, res) => {
    res.json({
      message: `Welcome!`
    });
  });
  app.get(CONFIG.CONTROLLER.ROUTES.WALLETS, (req, res) => {
    userController.getWallets(req, res);
  });
  app.get(CONFIG.CONTROLLER.ROUTES.CARDS, (req, res) => {
    userController.getCreditCards(req, res);
  });
  app.get(CONFIG.CONTROLLER.ROUTES.CARDS + ":cardId", (req, res) => {
    userController.getCreditCards(req, res);
  });
  app.get(CONFIG.CONTROLLER.ROUTES.TRANSACTIONS, (req, res) => {
    transactionController.getTransactions(req, res);
  });
  app.get(
    CONFIG.CONTROLLER.ROUTES.TRANSACTIONS + ":transactionId",
    (req, res) => {
      transactionController.getTransactions(req, res);
    }
  );

  return app;
}
