##!/usr/bin/env sh

DIR=$(pwd)
cd $DIR/terraform/vpc && terraform init
cd $DIR/terraform/ci && terraform init
