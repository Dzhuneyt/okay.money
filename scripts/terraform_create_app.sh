#!/usr/bin/env bash

# Exit on error
set -e

BASEDIR=$(pwd)
APP_VERSION=$1

VPC_ID=$(cd $BASEDIR/terraform/vpc && terraform output vpc_id)
PRIVATE_SUBNETS=$(cd $BASEDIR/terraform/vpc && terraform output private_subnets | tr -d '\n')
PUBLIC_SUBNETS=$(cd $BASEDIR/terraform/vpc && terraform output public_subnets | tr -d '\n')
CLUSTER_ID=$(cd $BASEDIR/terraform/ecs_cluster && terraform output cluster_id | tr -d '\n')
SERVICE_DISCOVERY_ID=$(cd $BASEDIR/terraform/ecs_cluster && terraform output service_discovery_id | tr -d '\n')
SG_FOR_S2_INSTANCES=$(cd $BASEDIR/terraform/ecs_cluster && terraform output security_group_for_ec2_instances | tr -d '\n')

tmpfile=$(mktemp)
# shellcheck disable=SC2129
echo private_subnets="${PRIVATE_SUBNETS}" >>"$tmpfile"
echo public_subnets="${PUBLIC_SUBNETS}" >>"$tmpfile"
echo vpc_id="\"${VPC_ID}\"" >>"$tmpfile"
echo cluster_id="\"${CLUSTER_ID}\"" >>"$tmpfile"

echo "Creating ECS app..."
cd $BASEDIR/terraform/app &&
  terraform init &&
  terraform apply -var-file="$tmpfile" -auto-approve

echo "ECS app created"

rm "$tmpfile"
