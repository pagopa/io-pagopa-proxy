FROM node:18.16.0 as builder

RUN addgroup --system user && adduser --ingroup user --system user

USER user:user

WORKDIR /usr/src/app

COPY /src /usr/src/app/src
COPY /pagopa_api /usr/src/app/pagopa_api
COPY /package.json /usr/src/app/package.json
COPY /tsconfig.json /usr/src/app/tsconfig.json
COPY /yarn.lock /usr/src/app/yarn.lock
RUN mkdir /usr/src/app/api-spec
COPY /api-spec/api-pagopa-proxy.yaml /usr/src/app/api-spec/api-pagopa-proxy.yaml
COPY /.eslintrc.js /usr/src/app/.eslintrc.js

USER root
RUN chmod -R 777 /usr/src/app

USER user:user
RUN yarn install \
  && yarn build

FROM node:18.16.0-alpine
LABEL maintainer="https://teamdigitale.governo.it"

# Install major CA certificates to cover
# https://github.com/SparebankenVest/azure-key-vault-to-kubernetes integration
RUN apk update && \
    apk add ca-certificates

WORKDIR /usr/src/app

COPY /package.json /usr/src/app/package.json
COPY --from=builder /usr/src/app/dist /usr/src/app/dist
COPY --from=builder /usr/src/app/node_modules /usr/src/app/node_modules

EXPOSE 80

CMD ["yarn", "start"]
