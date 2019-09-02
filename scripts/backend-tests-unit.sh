#!/usr/bin/env bash

docker-compose -f docker-compose.yml -f docker-compose.local.override.yml up --build backend_unit_tests_runner
