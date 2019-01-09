# Development
**Quick start**

1. `php yii init`
2. Start the lite server with `php yii server` (localhost:8080)
3. Write code

---

## Testing

###  Running functional tests

`composer test-functional`

**Prerequisites:**
1. Start by installing all dependencies (including PHPUnit) with `composer install`.
2. Make sure the config file has the correct DB credentials to connect to the testing database (`common/config/tests-local.php`) 
3. Start a lite server which the SUT will use to make all API calls. Use the shortcut command: `php yii server --test`. This will start a local PHP server, listening on `localhost:9009`

#### Running unit tests

`composer test-unit`

---

## Deploying to production
TBD

## Build status:
[![CircleCI](https://circleci.com/gh/Dzhuneyt/Personal-Finance.svg?style=shield&circle-token=eabf99331ae05bba76733a2865a779f24fa5bb73)](https://circleci.com/gh/Dzhuneyt/Personal-Finance)
