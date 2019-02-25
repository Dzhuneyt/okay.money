#!/usr/bin/env sh

killPreviousServer(){
    pidOfLiteServer=$(lsof -ti :9009)

    if [ ! -z "$pidOfLiteServer" -a "$pidOfLiteServer"!=" " ]; then
        kill ${pidOfLiteServer} && echo "Lite server killed" || echo "Lite server not found"
    fi
}

killPreviousServer || true

nohup php yii server --test >/dev/null 2>&1 &
pid=$!
echo "Started a lite server (in the background). Listening at localhost:9009 with PID: ${pid}";

# Execute tests
./vendor/bin/phpunit --configuration tests/functional/phpunit.xml --colors=auto

killPreviousServer
