// tslint:disable:no-any

/**
 * mockReq
 * @returns {{header, accepts, acceptsEncodings, acceptsEncoding, acceptsCharsets, acceptsCharset, acceptsLanguages, acceptsLanguage, range, param, is, reset: resetMock}}
 */

export default function mockReq(): any {
  const request = {
    accepts: jest.fn(),
    acceptsCharset: jest.fn(),
    acceptsCharsets: jest.fn(),
    acceptsEncoding: jest.fn(),
    acceptsEncodings: jest.fn(),
    acceptsLanguage: jest.fn(),
    acceptsLanguages: jest.fn(),
    header: jest.fn(),
    is: jest.fn(),
    param: jest.fn(),
    range: jest.fn(),
    reset: resetMock,
    _headers: {} as Record<string, string | undefined>,
    get headers() { return this._headers },
    set headers(newHeaders) {
      for(const k of Object.keys(newHeaders)) {
        this._headers[k.toLowerCase()] = newHeaders[k]
      }
    }
  };

  request.header.mockImplementation((k: string) => request.headers[k.toLowerCase()]);
  request.accepts.mockImplementation(() => request);
  request.acceptsEncodings.mockImplementation(() => request);
  request.acceptsEncoding.mockImplementation(() => request);
  request.acceptsCharsets.mockImplementation(() => request);
  request.acceptsCharset.mockImplementation(() => request);
  request.acceptsLanguages.mockImplementation(() => request);
  request.acceptsLanguage.mockImplementation(() => request);
  request.range.mockImplementation(() => request);
  request.param.mockImplementation(() => request);
  request.is.mockImplementation(() => request);

  return request;
}

/**
 * resetMock
 */
export function resetMock(this: any): any {
  this.header.mockClear();
  this.accepts.mockClear();
  this.acceptsEncodings.mockClear();
  this.acceptsEncoding.mockClear();
  this.acceptsCharsets.mockClear();
  this.acceptsCharset.mockClear();
  this.acceptsLanguages.mockClear();
  this.acceptsLanguage.mockClear();
  this.range.mockClear();
  this.param.mockClear();
  this.is.mockClear();
}
