<?php

namespace tests\functional\account;

use common\models\User;
use tests\functional\FunctionalTestCase;
use yii\web\ServerErrorHttpException;
use yii\web\UnauthorizedHttpException;

class CreateActionTest extends FunctionalTestCase
{

    /**
     * @var User
     */
    private $baseUser;

    protected function setUp()
    {
        parent::setUp();

        // Prerequisites for almost all tests
        $this->baseUser = $this->createUser();
        $this->loginAsUser($this->baseUser->id);
    }

    public function testCreateAccountSuccess()
    {
        $account = $this->createAccount();

        // Assertions
        $this->assertNotNull(
            $account['id'],
            'Failed to create a wallet as a regular user'
        );
    }

    public function testCreateAccountAndMakeSureIOwnIt()
    {
        $account = $this->createAccount();

        // Assertions
        $this->assertEquals(
            $account['owner_id'],
            $this->baseUser->id,
            'New wallet created but the owner ID is not my own ID'
        );
    }

    public function testCreateAccountWithStartingBalance()
    {
        // Prerequisites
        $accountStartingBalance = 99.9;

        // SUT
        $account = $this->apiCall(
            'v1/accounts',
            'POST',
            [
                'name' => '[TEST] My wallet with starting balance',
                'starting_balance' => $accountStartingBalance,
            ]
        );

        // Assertions
        $this->assertEquals(
            $accountStartingBalance,
            $account['starting_balance'],
            'Wallet created with starting balance ' . $accountStartingBalance
            . ' but the actual DB value is different'
        );
    }

    public function testFailToCreateAccountAnonymously()
    {
        $this->expectException(UnauthorizedHttpException::class);
        $this->logout();
        $this->apiCall(
            'v1/accounts',
            'POST',
            [
                'name' => '[TEST] My account',
            ]
        );
    }


    protected function tearDown()
    {
        if (!$this->deleteUser($this->baseUser->id)) {
            throw new ServerErrorHttpException('Can not delete temp user for tests: ' . $this->baseUser->id);
        }
        parent::tearDown();
    }
}