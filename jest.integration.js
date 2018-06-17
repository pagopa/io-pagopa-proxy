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
    "**/__integration__/*.ts"
  ]
}