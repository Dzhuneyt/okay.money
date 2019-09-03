#!/usr/bin/env sh

set -e

echo Executing PHPUnit tests
php ./vendor/bin/phpunit -c ./tests/unit/phpunit.xml
