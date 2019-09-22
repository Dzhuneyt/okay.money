#!/usr/bin/env bash

BRANCH=$1

if [ -z "$1" ]
  then
    echo "Branch name not provided"
    exit 1
fi

echo Initializing Terraform with env name: ${BRANCH}

terraform init -backend-config="key=personal-finance/app-${BRANCH}.tfstate"
