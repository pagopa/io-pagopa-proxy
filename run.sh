# 1. creare config-prod.yaml
# 2. lanciare lo script che crea la cartella azure-dashboard
docker run -v $(pwd):/home/nonroot/myfolder:Z \
  ghcr.io/pagopa/opex-dashboard:v1.4.4 generate \
  --template-name azure-dashboard \
  --config-file myfolder/monitor/config-"$1".yaml \
  --package myfolder

# 3. init cartella env dentro /azure-dashboard
cd ./azure-dashboard || exit
sh terraform.sh apply "$1"

# 3. init cartella .identity



docker run -v $(pwd):/home/nonroot/myfolder:Z \
  ghcr.io/pagopa/opex-dashboard:v1.4.6 generate \
  --template-name azure-dashboard \
  --config-file myfolder/monitor/config-prod.yaml \
  --package myfolder

