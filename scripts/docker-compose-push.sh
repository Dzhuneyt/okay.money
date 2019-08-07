##!/usr/bin/env sh

timestamp=$1

TAG=$timestamp docker-compose build
$(aws ecr get-login --no-include-email)
TAG=$timestamp docker-compose push
