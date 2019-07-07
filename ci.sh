#!/usr/bin/env bash

npm run installDeps && npm run beMigrations && concurrently 'npm run beLiteServer' 'npm run beLiteServerForTests' 'npm run feLiteServer'
