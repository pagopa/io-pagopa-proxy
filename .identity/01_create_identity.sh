#!/usr/bin/env bash

set -e

ENV=$1

ENV_FILE=".$ENV.env"

if [ -z "$ENV" ]; then
  echo "env should be: dev, uat or prod."
  exit 1
fi

if [[ ! -f ${ENV_FILE} ]]
then
    echo "${ENV_FILE} does not exist"
    exit 1
fi

source "${ENV_FILE}"

APP_NAME="github-${GITHUB_REPO_ORG}-${GITHUB_REPO_NAME}-${GITHUB_REPO_ENVIRONMENT}-sp"

echo "[INFO] Create enterprise application APP_NAME: ${APP_NAME}"
SP_CREDENTIAL_VALUES=$(az ad app create --display-name "${APP_NAME}" -o json)

APP_ID=$(jq -r '.appId' <<< "${SP_CREDENTIAL_VALUES}")
OBJECT_ID=$(jq -r '.id' <<< "${SP_CREDENTIAL_VALUES}")
echo "[INFO] Created enterprise application APP_ID: ${APP_ID}"
echo "[INFO] Created enterprise application OBJECT_ID: ${OBJECT_ID}"

echo "[INFO] Create service principal"
az ad sp create --id "${APP_ID}"
echo "[INFO] Created service principal ID: TODO"

CREDENTIAL_NAME="github-federated-${GITHUB_REPO_ENVIRONMENT}"
CREDENTIAL_REPO="repo:${GITHUB_REPO_ORG}/${GITHUB_REPO_NAME}"
CREDENTIAL_TYPE="ref:refs/heads/${GITHUB_REPO_BRANCH}"
# CREDENTIAL_TYPE="environment:prod"

echo "[INFO] Create Github federated credential"
az rest \
  --method POST \
  --uri "https://graph.microsoft.com/beta/applications/${OBJECT_ID}/federatedIdentityCredentials" \
  --body "{\"name\":\"${CREDENTIAL_NAME}\",\"issuer\":\"https://token.actions.githubusercontent.com\",\"subject\":\"${CREDENTIAL_REPO}:${CREDENTIAL_TYPE}\",\"description\":\"Federated\",\"audiences\":[\"api://AzureADTokenExchange\"]}"
echo "[INFO] Created Github federated credential"
