docker run -v $(pwd):/home/nonroot/myfolder:Z \
  ghcr.io/pagopa/opex-dashboard:latest generate \
  --template-name azure-dashboard \
  --config-file myfolder/monitor/config-prod.yaml \
  --package myfolder
