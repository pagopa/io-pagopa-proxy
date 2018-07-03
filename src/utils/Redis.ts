import { Either, left, right } from "fp-ts/lib/Either";
import { fromNullable, Option } from "fp-ts/lib/Option";
import { RedisClient } from "redis";

export function redisSet(
  redisClient: RedisClient,
  key: string,
  value: string,
  mode: string,
  duration: number
): Promise<Either<Error, "OK" | undefined>> {
  return new Promise(resolve => {
    if (!redisClient.connected) {
      return resolve(
        left<Error, "OK" | undefined>(new Error("Redis client not connected"))
      );
    }
    redisClient.set(
      key,
      value,
      mode,
      duration,
      (err, ret) =>
        err
          ? resolve(left<Error, "OK" | undefined>(err))
          : resolve(right<Error, "OK" | undefined>(ret))
    );
  });
}

export function redisGet(
  redisClient: RedisClient,
  key: string
): Promise<Either<Error, Option<string>>> {
  return new Promise(resolve => {
    if (!redisClient.connected) {
      return resolve(
        left<Error, Option<string>>(new Error("Redis client not connected"))
      );
    }
    redisClient.get(
      key,
      (err, ret) =>
        err
          ? resolve(left<Error, Option<string>>(err))
          : resolve(right<Error, Option<string>>(fromNullable(ret)))
    );
  });
}
