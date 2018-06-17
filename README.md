[![CircleCI](https://circleci.com/gh/teamdigitale/italia-pagopa-proxy.svg?style=svg)](https://circleci.com/gh/teamdigitale/italia-pagopa-proxy)

[![codecov](https://codecov.io/gh/teamdigitale/italia-pagopa-proxy/branch/master/graph/badge.svg)](https://codecov.io/gh/teamdigitale/italia-pagopa-proxy)

# PagoPA Proxy

## What is this?

This is a proxy for handling interactions with the pagoPA backend.

This project is part of the [digital citizenship initiative](https://teamdigitale.governo.it/en/projects/digital-citizenship.htm).

## ADRs

We use [ADR](http://thinkrelevance.com/blog/2011/11/15/documenting-architecture-decisions)s to track architectural decisions of this project.

This repository is configured for Nat Pryce's [adr-tools](https://github.com/npryce/adr-tools).

Here's the decisions we taken so far:

| ADR | Title                         | PR (discussion) |
| --- | ----------------------------- | --------------- |
| 1   | [Record architecture decisions](doc/architecture/decisions/0001-record-architecture-decisions.md) | [PR#25](https://github.com/teamdigitale/italia-pagopa-proxy/pull/25)                |
| 2   | [Use uuid/v1 for sequential requests](doc/adr/0002-use-uuid-v1-for-sequential-requests.md) | [PR#37](https://github.com/teamdigitale/italia-pagopa-proxy/pull/37)                |

## NOTES

This project includes @types/bluebird because it's necessary for node-soap.
It will be removed when this dependency will be fixed into soap:
https://github.com/vpulim/node-soap/pull/1009

### Environment variables

Those are all Environment variables needed by the application:

| Variable name                          | Description                                                                       | type   |
|----------------------------------------|-----------------------------------------------------------------------------------|--------|
| WINSTON_LOG_LEVEL                      | The log level used for Winston logger                                             | logLev |
| PAGOPAPROXY_HOST                       | The hostname or IP address the Express server is listening to                     | string |
| PAGOPAPROXY_PORT                       | The HTTP port the Express server is listening to                                  | int    |
| PAGOPA_HOST                            | The PagoPA SOAP Server hostname or IP address                                     | string |
| PAGOPA_PORT                            | The PagoPA SOAP Server port                                                       | int    |
| PAGOPA_TOKEN                           | The token used to authenticate to PagoPA SOAP Server                              | string |
| BACKEND_APP_HOST                       | The AppBackend RESTful Server hostname or IP address                              | string |
| BACKEND_APP_PORT                       | The AppBackend RESTful Server port                                                | int    |

logLev values: "error", "info", "debug"