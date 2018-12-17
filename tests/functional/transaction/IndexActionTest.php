<?php

namespace tests\functional\transaction;


use common\models\Account;
use common\models\Transaction;
use tests\functional\FunctionalTestCase;

class IndexActionTest extends FunctionalTestCase
{
    /**
     * @var Account
     */
    private $account;

    protected function setUp()
    {
        parent::setUp();

        $this->loginAsUser($this->baseUser->id);

        // Cleanup all transactions
        Transaction::deleteAll();

        $this->account = $this->createAccount($this->baseUser->id);
    }

    protected function tearDown()
    {
        $this->deleteAccount($this->account->id);
        parent::tearDown();
    }

    public function testCanListTransactions()
    {
        $transaction = $this->createTransaction($this->account->id);

        $apiResponse = $this->apiCall('v1/transactions', 'GET');

        $this->assertTrue($apiResponse['items'] > 0);

        // Cleanup
        $this->deleteTransaction($transaction->id);
    }

    public function testCanListOnlyMyTransactions()
    {
        // Prepare 1 "my" transaction and 1 "other guy" transaction
        $otherGuy = $this->createUser();
        $otherGuyAccount = $this->createAccount($otherGuy->id);

        $myTransaction = $this->createTransaction($this->account->id);
        $otherGuysTransaction = $this->createTransaction($otherGuyAccount->id);

        // SUT
        $apiResponse = $this->apiCall('v1/transactions', 'GET');

        $transactionIdFound = function ($idTransaction) use ($apiResponse) {
            foreach ($apiResponse['items'] as $transaction) {
                if ($transaction['id'] == $idTransaction) {
                    return true;
                }
            }
            return false;
        };

        // Assertions
        $this->assertTrue(
            $transactionIdFound($myTransaction->id),
            'Your own transaction was not found in the API response of transaction listing API'
        );
        $this->assertFalse(
            $transactionIdFound($otherGuysTransaction->id),
            'Transaction listing API wrongly returned the transactions of another user'
        );

        // Cleanup
        $this->deleteTransaction($myTransaction->id);
        $this->deleteTransaction($otherGuysTransaction->id);
        $this->deleteAccount($otherGuyAccount->id);
        $this->deleteUser($otherGuy->id);
    }

    public function testTransactionsCountMatches()
    {
        $NUM_INSERTED_TRANSACTIONS = 3;

        $tmpTransactions = [];
        for ($i = 0; $i < $NUM_INSERTED_TRANSACTIONS; $i++) {
            $tmpTransactions[] = $this->createTransaction($this->account->id);
        }

        // SUT
        $apiResponse = $this->apiCall('v1/transactions', 'GET');

        // Assertions
        $this->assertTrue(count($apiResponse['items']) === count($tmpTransactions));

        // Cleanup
        foreach ($tmpTransactions as $t) {
            $this->deleteTransaction($t->id);
        }
    }

}