#!/usr/bin/env bash

# Exit on error
set -e

CURRENT_UID=$(id -u):$(id -g) docker-compose -f docker-compose.yml -f docker-compose.local.override.yml up --build frontend_builder
