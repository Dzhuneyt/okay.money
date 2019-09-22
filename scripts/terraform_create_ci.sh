#!/usr/bin/env bash

# Exit on error
set -e

BASEDIR=$(pwd)

# Create or upgrade the VPC infrastructure
#echo Creating or upgrading VPC infrastructure... &&
#  cd "$BASEDIR"/terraform/vpc && terraform init && terraform apply -auto-approve &&
#  echo VPC provisioning finished

#VPC_ID=$(cd $BASEDIR/terraform/vpc && terraform output vpc_id)
#PRIVATE_SUBNETS=$(cd $BASEDIR/terraform/vpc && terraform output private_subnets | tr -d '\n')
#PUBLIC_SUBNETS=$(cd $BASEDIR/terraform/vpc && terraform output public_subnets | tr -d '\n')

# Initialize base directories

tmpfile=$(mktemp)
# shellcheck disable=SC2129

echo "Creating CodePipeline & CodeBuild..."
cd "$BASEDIR"/terraform/ci &&
  terraform init &&
  terraform apply -var-file="$tmpfile" -auto-approve -refresh=true

echo "CodePipeline & CodeBuild created"

rm "$tmpfile"
