## 1. Development
### 1.1 Getting started with development

1. `php yii init`
2. Start the lite server with `php yii server` (localhost:8080)
3. Write code

## 2. Deploying to production
TBD

## 3. Testing

#### 3.1 Running functional tests

Start by installing all dependencies with "composer update". This will install PHPUnit inside /vendor as well.

1. Make sure the config file has the correct DB credentials to connect to the testing database (common/config/tests-local.php) 
2. First start a lite server which the SUT will use to make all API calls. Use the shortcut command: `php yii test-serve`. This will start a local PHP server, listening on `localhost:9009`
3. Execute migrations towards the test DB so it's ready for SUT: `php yii-test migrate`
4. Run the Functional Tests: `php /vendor/phpunit/phpunit/phpunit --configuration /tests/functional/phpunit.xml`

#### 3.2 Running unit tests
Just run the command (after "composer update"):

`php /vendor/phpunit/phpunit/phpunit --configuration /tests/unit/phpunit.xml`