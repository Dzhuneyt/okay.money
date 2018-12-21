<?php

namespace tests\functional\transaction;


use tests\functional\FunctionalTestCase;
use yii\web\UnauthorizedHttpException;

class UpdateActionTest extends FunctionalTestCase
{

    protected function setUp()
    {
        parent::setUp();
        $this->loginAsUser($this->baseUser->id);
    }

    public function testCanUpdateMyTransaction()
    {
        $account = $this->createAccount($this->baseUser->id);
        $transaction = $this->createTransaction($account->id);

        $response = $this->apiCall('v1/transactions/' . $transaction->id, 'PUT', ['sum' => 3]);
        $this->assertEquals(3, $response['sum']);
    }

    public function testCanNotUpdateOtherPeoplesTransaction()
    {
        $stranger = $this->createUser();
        $account = $this->createAccount($stranger->id);
        $transaction = $this->createTransaction($account->id);

        $this->expectException(UnauthorizedHttpException::class);

        $this->apiCall('v1/transactions/' . $transaction->id, 'PUT', ['sum' => 1]);
    }

}