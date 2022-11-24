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

az account set -s "${SUBSCRIPTION_NAME}"
ACCOUNT_INFO=$(az account show 2> /dev/null)
AZURE_SUBSCRIPTION_ID=$(echo "$ACCOUNT_INFO" | jq ".id" -r)
AZURE_TENANT_ID=$(echo "$ACCOUNT_INFO" | jq ".homeTenantId" -r)

AZURE_APP_NAME="github-${GITHUB_REPO_ORG}-${GITHUB_REPO_NAME}-${GITHUB_REPO_ENVIRONMENT}-sp"
AZURE_CLIENT_ID=$(az ad sp list --all -o tsv --query "[?contains(displayName,'${AZURE_APP_NAME}')].{Name:appId}")

echo "[INFO] APP_NAME: ${AZURE_APP_NAME}"
echo "[INFO] AZURE_TENANT_ID: ${AZURE_TENANT_ID}"
echo "[INFO] AZURE_SUBSCRIPTION_ID: ${AZURE_SUBSCRIPTION_ID}"
echo "[INFO] AZURE_CLIENT_ID: ${AZURE_CLIENT_ID}"
