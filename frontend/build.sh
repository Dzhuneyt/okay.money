#!/usr/bin/env bash
set -e

npm i --no-audit
npm run build:watch
