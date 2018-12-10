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

        // Prepare fixtures
        $this->user = $this->createUser();
        $this->loginAsUser($this->user->id);

        // Create 3 accounts for this user
        for ($i = 0; $i < 3; $i++) {
            $this->accounts[] = $this->createAccount();
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

    protected function tearDown()
    {
        // Cleanup
        foreach ($this->accounts as $account) {
            Account::deleteAll(['id' => $account['id']]);
        }
        $this->deleteUser($this->user->id);

        parent::tearDown();
    }
}