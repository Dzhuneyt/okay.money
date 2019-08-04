##!/usr/bin/env sh

fail() {
  echo $1 >&2
  exit 1
}

retry() {
  local n=1
  local max=15
  local delay=3
  while true; do
    "$@" && break || {
      if [[ $n -lt $max ]]; then
        ((n++))
        echo "Command failed. Attempt $n/$max:"
        sleep $delay;
      else
        fail "The command has failed after $n attempts."
      fi
    }
  done
}

retry php yii migrate --interactive=0
