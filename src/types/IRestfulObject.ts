/**
 * Define an interface used to build responses for controllers
 */

export interface IRestfulObject {
  readonly [key: string]:
    | IRestfulObject
    | string
    | number
    | boolean
    | ReadonlyArray<IRestfulObject>
    | ReadonlyArray<string>
    | ReadonlyArray<number>;
}
