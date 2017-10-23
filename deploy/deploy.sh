#!/usr/bin/env bash

D_ENV=${1}
TAG=${2}
URL=${3}
export DEPLOY_ENVIRONMENT=${D_ENV}
export DEPLOY_TAG=${TAG}
export DEPLOY_URL=${URL}
for f in ./deploy/*-deploy.yml
do
  envsubst < $f > "./deploy/.generated/$(basename $f)"
done

kubectl apply -f ./deploy/.generated/