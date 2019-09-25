#!/usr/bin/env bash

timestamp=$(date -u +"%F-%H-UTC")

REGION="eu-west-1"
ECR_PREFIX="216987438199.dkr.ecr.${REGION}.amazonaws.com/finance"

ECR_PREFIX=$ECR_PREFIX TAG=$timestamp docker-compose build --parallel
ECR_PREFIX=$ECR_PREFIX TAG=$timestamp docker-compose up
