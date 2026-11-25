FROM node:14.16.0-alpine@sha256:0a6a21d28509f56155007444075ef4fdd36eef0a97924623cb641d3766e3b8d3

RUN apk update && apk upgrade && \
    apk add --no-cache bash ca-certificates git openssh openssl

WORKDIR /usr/src/app

ARG IO_PAGOPA_NODO_MOCK_COMMIT_SHA
ARG GITHUB_TOKEN
ARG PAGOPA_PORT
ENV GITHUB_TOKEN=${GITHUB_TOKEN}

RUN rm -rf * && \
    git clone https://github.com/pagopa/io-pagopa-node-mock.git /usr/src/app && \
    git checkout $IO_PAGOPA_NODO_MOCK_COMMIT_SHA

RUN yarn install && \
    yarn build

EXPOSE ${PAGOPA_PORT}

CMD ["yarn", "start"]