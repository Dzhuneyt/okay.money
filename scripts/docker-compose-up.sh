##!/usr/bin/env sh

timestamp=$(date -u +"%F-%H-UTC")

TAG=$timestamp docker-compose up --build
