<?php

namespace tests\functional\transaction;


use tests\functional\FunctionalTestCase;
use yii\web\ForbiddenHttpException;

class ViewActionTest extends FunctionalTestCase
{

    protected function setUp()
    {
        parent::setUp();

        $this->loginAsUser($this->baseUser->id);
    }

    public function testCanViewMyTransaction()
    {
        $account = $this->createAccount($this->baseUser->id);
        $transaction = $this->createTransaction($account->id, 51);

        $result = $this->apiCall('v1/transactions/' . $transaction->id, 'GET');

        $this->assertEquals($transaction->id, $result['id'], 'Can not VIEW information for my own single transaction');
        $this->assertEquals(51, $result['sum'], 'transaction VIEW returned the wrong sum parameter');
    }

    public function testCanNotViewOtherPeopleTransaction()
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
