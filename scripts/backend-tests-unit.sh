#!/usr/bin/env bash

# Exit on error
set -e

docker-compose -f docker-compose.yml -f docker-compose.local.override.yml up backend_unit_tests_runner
