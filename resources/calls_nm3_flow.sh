#!/bin/bash

set -e

# RPTID = CF_PA + NOTICE_NUMBER
RPTID=01234567891010302009567890123

ccp_importo=`curl --location --request GET "http://localhost:3000/payment-requests/$RPTID" | jq '"\(.codiceContestoPagamento) \(.importoSingoloVersamento)"'`

app=`sed -e 's/^"//' -e 's/"$//' <<<"${ccp_importo}"`

ccp=`echo $app | cut -d' ' -f1`
importo=`echo $app | cut -d' ' -f2`

echo "phase 1 - verify rsp => codiceContestoPagamento ${ccp} importo ${importo}"

generate_post_data()
{
  cat <<EOF
{
    "rptId":"01234567891010302009567890123",
    "importoSingoloVersamento": $importo,
    "codiceContestoPagamento": "$ccp"
}
EOF
}

importoSingoloVersamento=`curl --location --request POST 'http://localhost:3000/payment-activations' \
--header 'Content-Type: application/json' \
--data-raw "$(generate_post_data)" | jq '.importoSingoloVersamento'`

echo "phase 2 - activation rsp => importoSingoloVersamento" ${importoSingoloVersamento}

app=`sed -e 's/^"//' -e 's/"$//' <<<"${ccp}"`
endpoint="http://localhost:3000/payment-activations/${app}"

idPagamento=`curl --location --request GET ${endpoint} | jq '.idPagamento'`

echo "phase 3 - get idPagamento/paymentToken = " ${idPagamento}