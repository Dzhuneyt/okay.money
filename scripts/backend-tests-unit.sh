#!/usr/bin/env bash

docker-compose -f docker-compose.yml -f docker-compose.local.override.yml up --no-color --build backend_unit_tests_runner
