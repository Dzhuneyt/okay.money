#!/usr/bin/env bash

# Exit on error
set -e

timestamp=$(date -u +"%F-%H-%M-UTC")

TAG=$timestamp docker-compose build --parallel
$(aws ecr get-login --no-include-email)
TAG=$timestamp docker-compose push

cd ./terraform

terraform apply -var "version_tag=$timestamp" -auto-approve
