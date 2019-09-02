#!/bin/bash

chmod +x /app/scripts/*
echo Entrypoint executed

exec "$@"
