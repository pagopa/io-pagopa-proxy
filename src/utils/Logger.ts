/**
 * Define a custom Logger using winston
 */

import * as winston from "winston";
import { CONFIG } from "../Configuration";

export const logger = new winston.Logger({
  level: CONFIG.WINSTON_LOG_LEVEL,
  transports: [new winston.transports.Console()]
});

export function disableConsoleLog(): void {
  logger.remove(winston.transports.Console);
}
