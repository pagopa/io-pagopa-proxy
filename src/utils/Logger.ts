/**
 * Define a custom Logger using winston
 */

import * as winston from "winston";

export const logger = new winston.Logger({
  level: "debug",
  transports: [new winston.transports.Console()]
});

export function disableConsoleLog(): void {
  logger.remove(winston.transports.Console);
}
