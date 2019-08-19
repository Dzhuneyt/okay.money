#!/usr/bin/env bash

cd ./terraform && terraform apply -var "version_tag=unused" -auto-approve -target=module.route53_delegation_set

echo Please change the domain to these nameservers and proceed with terraform_apply.sh to create the rest of the infrastructur
