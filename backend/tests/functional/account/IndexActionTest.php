<?php

namespace tests\functional\account;


use common\models\Account;
use common\models\User;
use tests\functional\FunctionalTestCase;

class IndexActionTest extends FunctionalTestCase
{
    /**
     * @var User
     */
    private $user;

    private $accounts = [];

    protected function setUp()
    {
        parent::setUp();

        // Initial cleanup to prevent leftover rows from previous test
        Account::deleteAll();

        // Prepare fixtures
        $this->loginAsUser($this->baseUser->id);

        // Create 3 accounts for this user
        for ($i = 0; $i < 3; $i++) {
            $this->accounts[] = $this->createAccount($this->baseUser->id);
        }
    }

    public function testGetMyAccountsList()
    {
        $accounts = $this->apiCall(
            'v1/accounts',
            'GET'
        );
        $this->assertEquals(
            3,
            count($accounts['items']),
            'Accounts number returned from API does not reflect actual account number'
        );
    }

    public function testAccountListingApiReturnsCorrectTotalCount()
    {
        $accounts = $this->apiCall(
            'v1/accounts',
            'GET'
        );
        $this->assertEquals(
            3,
            $accounts['_meta']['totalCount']
        );
    }

    public function testAccountBalanceReturnsCorrectFloatValues()
    {
        $account = $this->createAccount($this->baseUser->id);

        $this->createTransaction($account->id, 5.5);
        $this->createTransaction($account->id, 15.99);
        $this->createTransaction($account->id, 25.003);

        $accounts = $this->apiCall(
            'v1/accounts',
            'GET'
        );

        foreach ($accounts['items'] as $singleApiResult) {
            if ($singleApiResult['id'] == $account->id) {
                $this->assertEquals(number_format(5.5 + 15.99 + 25.003, 2), $singleApiResult['current_balance']);
            }
        }

        $this->deleteAccount($account->id); // Cleanup
    }

    public function testAccountListingReturnsRoundedValues()
    {
        $RANDOM_FLOAT = 3.456789012345;
        $RANDOM_STARTING_BALANCE = 1.23456;
        $ROUNDED_FLOAT = $RANDOM_FLOAT + $RANDOM_STARTING_BALANCE;

        Account::deleteAll();
        $account = $this->createAccount($this->baseUser->id);
        $account->starting_balance = 1.23456;
        $account->save(false);

        $this->createTransaction($account->id, $RANDOM_FLOAT);
        $accounts = $this->apiCall(
            'v1/accounts',
            'GET'
        );
        $this->assertEquals(
            number_format($ROUNDED_FLOAT, 2),
            $accounts['items'][0]['current_balance']
        );
    }

    public function testAccountBalanceConsidersStartingBalance()
    {
        $account = $this->createAccount($this->baseUser->id);
        $account->starting_balance = 5;
        $account->save(false);

        $this->createTransaction($account->id, 3);

        $accounts = $this->apiCall(
            'v1/accounts',
            'GET'
        );

        foreach ($accounts['items'] as $singleApiResult) {
            if ($singleApiResult['id'] == $account->id) {
                $this->assertEquals(8, $singleApiResult['current_balance']);
            }
        }

        $this->deleteAccount($account->id); // Cleanup
    }

    public function testPreflight()
    {
        $this->assertPreflightrequest('v1/accounts');
    }

    protected function tearDown()
    {
        // Cleanup
        foreach ($this->accounts as $account) {
            $this->deleteAccount($account['id']);
        }

        parent::tearDown();
    }
}
