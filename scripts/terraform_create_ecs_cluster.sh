#!/usr/bin/env bash

# Exit on error
set -e

timestamp=$1

if [ -z "$1" ]
  then
    echo "No argument supplied"
    timestamp=$(date -u +"%F-%H-%M-UTC")
fi

TAG=$timestamp docker-compose build --parallel
$(aws ecr get-login --no-include-email)
TAG=$timestamp docker-compose push

cd ./terraform
terraform init
terraform apply -var "version_tag=$timestamp" -auto-approve
