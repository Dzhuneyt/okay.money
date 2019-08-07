##!/usr/bin/env sh

BASEDIR=$(dirname "$0")

timestamp=$(date -u +"%F-%H-%M-UTC")

$BASEDIR/docker-compose-push.sh $timestamp

# Generate Dockerrun.aws.json from the template file
# Fix the version tags of images
rm Dockerrun.aws.json || true
cp .dist.Dockerrun.aws.json Dockerrun.aws.json

# Declare an array of string with type
declare -a StringArray=(
  "216987438199.dkr.ecr.us-east-1.amazonaws.com/finance/nginx"
  "216987438199.dkr.ecr.us-east-1.amazonaws.com/finance/backend"
  "216987438199.dkr.ecr.us-east-1.amazonaws.com/finance/frontend")

# Iterate the string array using for loop
for val in ${StringArray[@]}; do
  ORIGINAL_IMAGE_NAME=$val
  TAGGED_IMAGE_NAME="$val:$timestamp"

  sed -i 's#'${ORIGINAL_IMAGE_NAME}'#'${TAGGED_IMAGE_NAME}'#g' Dockerrun.aws.json
done

# Add the newly generated Dockerrun.aws.json to the Git index, otherwise deploy fails
git add .

eb deploy --staged --verbose

rm Dockerrun.aws.json
