#!/bin/bash
usage=$1

env_file="ENV_TEST.postman_environment.json"
if [[ $2 ]]; then
    if [[ -f $2 ]]; then
        env_file=$2
    else
        echo "Error: environment file $2 does not exist"
        exit 1
    fi
fi

if [[ "$usage" =~ ^(postman|k6|paForNode|pspForNode)$ ]]; then
    if [ "$usage" = "k6" ]
    then
        postman-to-k6 NM3.postman_collectionV1.json --environment $env_file -o generated/script.js
        k6 run --vus 10 --duration 5s generated/script.js
    else
        newman run NM3.postman_collection.json --environment=$env_file --reporters cli
    fi
else
    echo "Error: Argument for '$usage' is no allowed (typing postman or k6)" >&2
    exit 1
fi
