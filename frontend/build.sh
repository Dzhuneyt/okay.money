#!/usr/bin/env bash
set -e

echo Updating frontend dependencies
npm i --no-audit

echo Building frontend in watch mode
npm run build:watch
