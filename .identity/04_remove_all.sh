#!/usr/bin/env bash

# set -e

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
SP_OBJECT_ID=$(az ad sp list --all -o tsv --query "[?contains(displayName,'${APP_NAME}')].{Name:id}")

echo "[INFO] Remove role assignment SP_OBJECT_ID: ${SP_OBJECT_ID}"
az role assignment delete \
  --subscription="${SUBSCRIPTION_ID}" \
  --assignee "${SP_OBJECT_ID}"

echo "[INFO] Delete service principal SP_OBJECT_ID: ${SP_OBJECT_ID}"
az ad sp delete --id "${SP_OBJECT_ID}"

echo "[INFO] Get enterprise application APP_NAME: ${APP_NAME}"
APP_OBJECT_ID=$(az ad app list --all -o tsv --query "[?contains(displayName,'$APP_NAME')].{Name:id}")

echo "[INFO] Delete enterprise application APP_OBJECT_ID: ${APP_OBJECT_ID}"
az ad app delete --id "${APP_OBJECT_ID}"
