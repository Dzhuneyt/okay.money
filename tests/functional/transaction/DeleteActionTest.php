<?php

namespace tests\functional\transaction;


use tests\functional\FunctionalTestCase;
use yii\web\ForbiddenHttpException;
use yii\web\UnauthorizedHttpException;

class DeleteActionTest extends FunctionalTestCase
{

    protected function setUp()
    {
        parent::setUp();

        $this->loginAsUser($this->baseUser->id);
    }

    public function testCanDeleteMyTransaction()
    {
        $account = $this->createAccount($this->baseUser->id);
        $transaction = $this->createTransaction($account->id, 51);

        $result = $this->apiCall('v1/transactions/' . $transaction->id, 'DELETE');

        $this->assertNull($result);
    }

    public function testCanNotDeleteOtherPeopleTransactions()
    {
        $stranger = $this->createUser();
        $accountOfStranger = $this->createAccount($stranger->id);
        $strangerTransaction = $this->createTransaction($accountOfStranger->id);

        $this->expectException(ForbiddenHttpException::class);

        try {
            $this->apiCall('v1/transactions/' . $strangerTransaction->id, 'GET');
        } finally {
            // Cleanup
            $this->deleteUser($stranger->id);
        }
    }
}