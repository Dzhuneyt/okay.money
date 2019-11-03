#!/usr/bin/env sh

set -e

echo Executing PHPUnit tests
echo MySQL host is ${MYSQL_HOST}
echo MySQL db is ${MYSQL_DB}
echo MySQL user is ${MYSQL_USER}
echo MySQL password is ${MYSQL_PASS}

dockerize -wait tcp://${MYSQL_HOST}:3306 && \
    sleep 1 && \
    php ./vendor/bin/phpunit -c ./tests/functional/phpunit.xml --testdox --verbose
