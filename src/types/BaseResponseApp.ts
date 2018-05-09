/**
 * Italia PagoPA Proxy
 * Cittadinanza Digitale PagoPA services
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
