[![CircleCI](https://circleci.com/gh/teamdigitale/italia-pagopa-proxy.svg?style=svg)](https://circleci.com/gh/teamdigitale/italia-pagopa-proxy)

[![codecov](https://codecov.io/gh/teamdigitale/italia-pagopa-proxy/branch/master/graph/badge.svg)](https://codecov.io/gh/teamdigitale/italia-pagopa-proxy)

[![Maintainability](https://api.codeclimate.com/v1/badges/5a8e35c5db40f63c3ebf/maintainability)](https://codeclimate.com/github/teamdigitale/italia-pagopa-proxy/maintainability)

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fteamdigitale%2Fitalia-pagopa-proxy.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fteamdigitale%2Fitalia-pagopa-proxy?ref=badge_shield)

# PagoPA Proxy

## What is this?

This is a proxy for handling interactions with the pagoPA backend.

This project is part of the [digital citizenship initiative](https://teamdigitale.governo.it/en/projects/digital-citizenship.htm).

## ADRs

We use [ADR](http://thinkrelevance.com/blog/2011/11/15/documenting-architecture-decisions)s to track architectural decisions of this project.

This repository is configured for Nat Pryce's [adr-tools](https://github.com/npryce/adr-tools).

Here's the decisions we taken so far:

| ADR | Title        | PR (discussion) |
| --- | ----------------------------- | --------------- |
| 1   | [Record architecture decisions](doc/architecture/decisions/0001-record-architecture-decisions.md) | [PR#25](https://github.com/teamdigitale/italia-pagopa-proxy/pull/25)                |
| 2   | [Use uuid/v1 for sequential requests](doc/adr/0002-use-uuid-v1-for-sequential-requests.md) | [PR#37](https://github.com/teamdigitale/italia-pagopa-proxy/pull/37)                |

## NOTES

This project includes @types/bluebird because it's necessary for node-soap.
It will be removed when this dependency will be fixed into soap:
https://github.com/vpulim/node-soap/pull/1009

### Environment variables

Those are all Environment variables needed by the application:

| Variable name       | Description                                                   | type    | default       |
|---------------------|---------------------------------------------------------------|---------|---------------|
| WINSTON_LOG_LEVEL   | The log level used for Winston logger                         | logLev  | debug         |
| PAGOPAPROXY_HOST    | The hostname or IP address the Express server is listening to | string  | localhost     |
| PAGOPAPROXY_PORT    | The HTTP port the Express server is listening to              | int     | 3000          |
| PAGOPA_HOST         | The PagoPA SOAP Server hostname or IP address                 | string  | localhost     |
| PAGOPA_PORT         | The PagoPA SOAP Server port                                   | int     | 3001          |
| PAGOPA_TOKEN        | The token used to authenticate to PagoPA SOAP Server          | string  | ND            |
| REDIS_DB_URL        | The Redis DB Server URL                                       | string  | localhost     |
| REDIS_DB_PORT       | The Redis DB Server port                                      | int     | 6379          |
| REDIS_DB_PASSWORD   | The Redis DB Server password                                  | string  | ND            |
| REDIS_USE_CLUSTER   | Enable Redis Cluster                                          | boolean | false         |

logLev values: "error", "info", "debug"

## OpenAPI specs

Swagger API specs are available at /specs/api/v1/swagger.json
For example, running it on local enviroment it's reachable at http://localhost:3000/api/v1/swagger.json

## How to install and run the application

1. yarn install
2. yarn build
3. yarn start

## License

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fteamdigitale%2Fitalia-pagopa-proxy.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fteamdigitale%2Fitalia-pagopa-proxy?ref=badge_large)
