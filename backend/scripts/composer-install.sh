#!/usr/bin/env bash

docker build -t composer - <./Dockerfile-composer-install
docker run --rm --interactive \
  --volume "$PWD":/app:delegated \
  --user $(id -u):$(id -g) \
  composer
