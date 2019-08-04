#!/usr/bin/env sh

# Execute tests
n=0
until [ $n -ge 5 ]; do
  ./vendor/bin/phpunit --configuration tests/functional/phpunit.xml --colors=auto && break # substitute your command here
  n=$(($n + 1))
  echo Command failed. Sleeping for a while
  sleep 15
done
