/**
 * NotificationsDispatchRequest
 * Define the request to send to CD Avvisi API to notify a new notification
 */

import * as t from "io-ts";

export const NotificationsDispatchRequest = t.interface({});
export type NotificationsDispatchRequest = t.TypeOf<
  typeof NotificationsDispatchRequest
>;
