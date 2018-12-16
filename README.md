### Running tests

#### Funcitonal tests
- First start a lite server which the SUT will use to make all API calls. Use the shortcut command: `php yii server`. This will start a local PHP server, listening on `localhost:9009`
- Make sure the config file has the correct DB credentials to connect to the testing database (common/config/tests-local.php) 
- Run the Functional Tests: `php /vendor/phpunit/phpunit/phpunit --configuration /tests/functional/phpunit.xml --teamcity`

Configuration file is located in /tests/phpunit.xml