#!/usr/bin/env bash

cd ./terraform && terraform destroy -var "version_tag=ignored_anyway" -auto-approve
