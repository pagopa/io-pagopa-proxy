# 1. create config-prod.yaml
# 2. lanciare lo script che crea la cartella azure-dashboard
# 2. init cartella env dentro /azure-dashboard
# 3. init cartella .identity

# shellcheck disable=SC2046
docker run -v $(pwd):/home/nonroot/myfolder:Z \
  ghcr.io/pagopa/opex-dashboard:latest generate \
  --template-name azure-dashboard \
  --config-file myfolder/monitor/config-"$1".yaml \
  --package myfolder

cd ./azure-dashboard || exit
sh terraform.sh apply "$1"
