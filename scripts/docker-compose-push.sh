##!/usr/bin/env sh

timestamp=$1

$(aws ecr get-login --region us-east-1 --no-include-email)
TAG=$timestamp docker-compose pull
TAG=$timestamp docker-compose build
TAG=$timestamp docker-compose push
