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
    "**/__integration__/*.ts","**/__tests__/*.ts"
  ],
  "reporters": [
    "default",
    [ "jest-junit", {
      "outputDirectory": "./test_reports",
      "outputName": "pagopa-proxy-IT.xml"
    } ]
  ],
  coverageReporters: ["cobertura"],
  coveragePathIgnorePatterns: [
    "MockedData.ts"
  ]
}