/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
 *
 */

import * as bodyParser from "body-parser";
import * as express from "express";
import * as morgan from "morgan";

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

  // setup routes
  app.get("/", (_, res) => {
    res.json({
      message: `Welcome!`
    });
  });

  app.get("/wallet", (req, res) => {
    userController.getWallet(req, res);
  });

  app.get("/cards", (req, res) => {
    userController.getCreditCards(req, res);
  });

  app.get("/cards/:cardid", (req, res) => {
    userController.getCreditCard(req, res);
    console.log(req.path);
  });

  return app;
}
