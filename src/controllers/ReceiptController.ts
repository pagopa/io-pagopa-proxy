/**
 * Receipt Controllers
 * Controllers for Receipts Endpoints
 */

import * as express from "express";
import { CDAvvisiConfig } from "../Configuration";

// Forward new receipts from PagoPa API to CDAvvisi API
export async function dispatchReceipt(
  req: express.Request,
  res: express.Response,
  cdAvvisiConfig: CDAvvisiConfig
): Promise<boolean> {
  return false;
}
