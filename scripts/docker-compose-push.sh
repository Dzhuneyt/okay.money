##!/usr/bin/env sh

timestamp=$1

TAG=$timestamp docker-compose build
$(aws ecr get-login --region us-east-1 --no-include-email)
TAG=$timestamp docker-compose push
