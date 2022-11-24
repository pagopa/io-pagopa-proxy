#!/usr/bin/env bash

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
SUBSCRIPTION_ID=$(echo "$ACCOUNT_INFO" | jq ".id" -r)

APP_NAME="github-${GITHUB_REPO_ORG}-${GITHUB_REPO_NAME}-${GITHUB_REPO_ENVIRONMENT}-sp"

echo "[INFO] Get service principal APP_NAME: ${APP_NAME}"
SP_OBJECT_ID=$(az ad sp list --all -o tsv --query "[?contains(displayName,'$APP_NAME')].{Name:id}")

echo "[INFO] Remove role assignment SP_OBJECT_ID: ${SP_OBJECT_ID}"
az role assignment delete \
  --subscription="${SUBSCRIPTION_ID}" \
  --assignee "${SP_OBJECT_ID}"

az role assignment create \
  --role contributor \
  --subscription "${SUBSCRIPTION_ID}" \
  --assignee-object-id "${SP_OBJECT_ID}" \
  --assignee-principal-type ServicePrincipal \
  --scope "/subscriptions/${SUBSCRIPTION_ID}"

