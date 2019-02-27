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


#### Consuming fixtures inside a functional test
Fixtures can be consumed (loaded and unloaded) inside functional test files as well. For example:

    class MyTest extends tests\functional\FunctionalTestCase {
    
        public function fixtures()
        {
            // Define the fixtures that will be
            // available for consuming in the scope
            // of the current test file
            return [
                'account' => [
                    'class' => AccountFixture::class,
                ],
            ];
        }
        
        public function testSomeFunctionality(){
            // Consume a fixture to test DB
            $this->getFixture('account')->load();
            
            // SUT here

            // Cleanup consumed fixture from test DB
            $this->getFixture('account')->unload();
        }
    }


---

## Deploying to production
TBD

## Build status:
[![CircleCI](https://circleci.com/gh/Dzhuneyt/Personal-Finance.svg?style=shield&circle-token=eabf99331ae05bba76733a2865a779f24fa5bb73)](https://circleci.com/gh/Dzhuneyt/Personal-Finance)


## Miscellaneous

### Using yii2-faker to create fixtures with sample data 

    php yii fixture/generate user --count=15
    php yii fixture/generate category --count=1500 // Will distribute them randomly across users when loaded to DB
    php yii fixture/generate account --count=1500 // Will distribute them randomly across users when loaded to DB
    php yii fixture/generate transaction --count=3000 // Will distribute them randomly across users, accounts and categories

The above command will generate the fixture "data" files (/fixtures/data). Those files are not actually used until you decide to load them into the database.

### Loading fixtures into the database for development purposes

    php yii fixture/load "User"
    php yii fixture/load "Category"
    php yii fixture/load "Account"
    php yii fixture/load "Transaction"


## Commands

#### Create a user "demo" with password "password"
`php yii user/create demo password`

#### Get the auth key for the user with username "demo"
`php yii user/get-auth-key demo`

#### Delete a user with username "demo"
`php yii user/delete demo`
