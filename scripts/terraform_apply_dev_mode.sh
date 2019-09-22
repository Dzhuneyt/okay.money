#!/usr/bin/env bash

# Exit on error
set -e

cd ./terraform && terraform apply -var "version_tag=latest" -auto-approve
