#!/usr/bin/env bash

# Exit on error
set -e

docker-compose -f docker-compose.yml -f docker-compose.local.override.yml up --no-color --exit-code-from backend_functional_tests_runner backend_functional_tests_runner

exit $?
