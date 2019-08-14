#!/usr/bin/env bash

timestamp=$(date -u +"%F-%H-%M-UTC")

cd ./terraform && terraform destroy -var "version_tag=$timestamp" -auto-approve
