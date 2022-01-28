FROM circleci/node:14.16.0 as builder

RUN sudo apt-get -y install --no-install-recommends libunwind8=1.1-4.1

WORKDIR /usr/src/app

COPY /src /usr/src/app/src
COPY /pagopa_api /usr/src/app/pagopa_api
COPY /package.json /usr/src/app/package.json
COPY /tsconfig.json /usr/src/app/tsconfig.json
COPY /yarn.lock /usr/src/app/yarn.lock
COPY /api_pagopa.yaml /usr/src/app/api_pagopa.yaml
COPY /.eslintrc.js /usr/src/app/.eslintrc.js

RUN sudo chmod -R 777 /usr/src/app \
  && yarn install \
  && yarn build

FROM node:14.16.0-alpine
LABEL maintainer="https://teamdigitale.governo.it"

# Install major CA certificates to cover
# https://github.com/SparebankenVest/azure-key-vault-to-kubernetes integration
RUN apk update && \
    apk add ca-certificates

WORKDIR /usr/src/app

COPY /package.json /usr/src/app/package.json
COPY --from=builder /usr/src/app/dist /usr/src/app/dist
COPY --from=builder /usr/src/app/node_modules /usr/src/app/node_modules
COPY /.node_config.json /usr/src/app/.node_config.json

EXPOSE 80

CMD ["yarn", "start"]
