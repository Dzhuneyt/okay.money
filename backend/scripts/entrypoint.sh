#!/bin/bash

chmod +x /app/scripts/*
echo Entrypoint executed

echo Executing migrations
echo MySQL host is ${MYSQL_HOST}
#echo MySQL db is ${MYSQL_DB}
#echo MySQL user is ${MYSQL_USER}
#echo MySQL password is ${MYSQL_PASS}

dockerize -wait tcp://${MYSQL_HOST}:3306 -timeout 30s && \
    php yii migrate --interactive=0 && \
    exec "$@"
