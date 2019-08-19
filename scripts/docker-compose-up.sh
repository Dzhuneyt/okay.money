##!/usr/bin/env sh

timestamp=$(date -u +"%F-%H-UTC")

docker system prune -f
TAG=$timestamp docker-compose build --parallel
TAG=$timestamp docker-compose up
