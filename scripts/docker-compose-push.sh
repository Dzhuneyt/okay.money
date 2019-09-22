#!/usr/bin/env bash

timestamp=$1
if [ -z "$1" ]
  then
    timestamp=$(date -u +"%F-%H-%M-UTC")
fi

REGION="eu-west-1"
ECR_PREFIX="216987438199.dkr.ecr.${REGION}.amazonaws.com/finance"

$(aws ecr get-login --region ${REGION} --no-include-email)
ECR_PREFIX=${ECR_PREFIX} TAG=${timestamp} docker-compose pull
ECR_PREFIX=${ECR_PREFIX} TAG=${timestamp} docker-compose build --parallel
ECR_PREFIX=${ECR_PREFIX} TAG=${timestamp} docker-compose push
