#!/usr/bin/env bash

export BRANCH=$(git branch | grep \* | cut -d ' ' -f2)
