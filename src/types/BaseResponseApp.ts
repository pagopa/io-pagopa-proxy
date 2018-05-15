/**
 * Define an interface used to build responses for controllers
 */

export interface IRestfulObject {
  [key: string]:
    | IRestfulObject
    | string
    | number
    | boolean
    | ReadonlyArray<IRestfulObject>
    | ReadonlyArray<string>
    | ReadonlyArray<number>
    | undefined; // tslint:disable-line
}
