#!/usr/bin/env bash

BRANCH=$(git branch | grep \* | cut -d ' ' -f2)

echo Initializing Terraform with env name: ${BRANCH}

terraform init -backend-config="key=personal-finance/app-${BRANCH}.tfstate"
