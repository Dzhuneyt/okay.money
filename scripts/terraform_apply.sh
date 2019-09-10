#!/usr/bin/env bash

# Exit on error
set -e

timestamp=$1

if [ -z "$1" ]
  then
    timestamp=$(date -u +"%F-%H-%M-UTC")
fi

ECR_PREFIX="216987438199.dkr.ecr.eu-west-1.amazonaws.com/finance"

ECR_PREFIX=$ECR_PREFIX TAG=$timestamp docker-compose build --parallel
$(aws ecr get-login --no-include-email --region eu-west-1)
ECR_PREFIX=$ECR_PREFIX TAG=$timestamp docker-compose push

cd ./terraform
terraform init
terraform apply -var "version_tag=$timestamp" -auto-approve
