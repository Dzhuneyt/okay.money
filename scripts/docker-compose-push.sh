##!/usr/bin/env sh

timestamp=$(date -u +"%F-%H-%M-UTC")

TAG=$timestamp docker-compose build
$(aws ecr get-login --no-include-email)
TAG=$timestamp docker-compose push
