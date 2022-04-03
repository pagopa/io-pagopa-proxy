module.exports = {
  "verbose": true,
  "testEnvironment": "node",
  "moduleFileExtensions": [
    "ts",
    "js"
  ],
  "transform": {
    "^.+\\.(ts|tsx)$": "<rootDir>/node_modules/ts-jest/preprocessor.js"
  },
  "testMatch": [
    "**/__integration__/*.ts","**/__tests__/*test.ts"
  ],
  "reporters": [
    "default",
    [ "jest-junit", {
      "outputDirectory": "./test_reports",
      "outputName": "pagopa-proxy-tests.xml"
    } ]
  ],
  "collectCoverage": true,
  "coverageReporters": ["cobertura"],
  "coverageDirectory": "./coverage/",
  "coveragePathIgnorePatterns": [
    "MockedData.ts",
    "fakePagamentiTelematiciPspNodoAsyncClient.ts",
    "fakePagamentiTelematiciPspNodoNm3AsyncClient.ts", 
    "request.ts", 
    "response.ts",
    "pagopa.ts",
    "SoapUtils.ts",
    "PaymentsConverter.ts"
  ],
}