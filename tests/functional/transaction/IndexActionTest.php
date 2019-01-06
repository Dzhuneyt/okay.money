<?php

namespace tests\functional\transaction;


use common\models\Account;
use common\models\Transaction;
use tests\functional\FunctionalTestCase;
use yii\web\BadRequestHttpException;
use yii\web\ForbiddenHttpException;

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
        $otherGuy        = $this->createUser();
        $otherGuyAccount = $this->createAccount($otherGuy->id);

        $myTransaction        = $this->createTransaction($this->account->id);
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

    public function testTypeFilterReturnsCorrectlyExpensesOnly()
    {
        $idAccount         = $this->account->id;
        $tmpTransactions   = [];
        $tmpTransactions[] = $this->createTransaction($idAccount, -5);
        $tmpTransactions[] = $this->createTransaction($idAccount, 1);
        $tmpTransactions[] = $this->createTransaction($idAccount, 99);
        $tmpTransactions[] = $this->createTransaction($idAccount, -199);
        $tmpTransactions[] = $this->createTransaction($idAccount, 345);
        $tmpTransactions[] = $this->createTransaction($idAccount, 0);

        $apiResponse = $this->apiCall(
            'v1/transactions',
            'GET',
            [
                'type' => 'expense'
            ]
        );
        foreach ($apiResponse['items'] as $item) {
            $this->assertLessThan(
                0,
                $item['sum'],
                'Transaction listing API, filtered by "type=expense" wrongly returned "income" transactions'
            );
        }
    }

    public function testTypeFilterReturnsCorrectlyIncomesOnly()
    {
        $idAccount         = $this->account->id;
        $tmpTransactions   = [];
        $tmpTransactions[] = $this->createTransaction($idAccount, -5);
        $tmpTransactions[] = $this->createTransaction($idAccount, 1);
        $tmpTransactions[] = $this->createTransaction($idAccount, 99);
        $tmpTransactions[] = $this->createTransaction($idAccount, -199);
        $tmpTransactions[] = $this->createTransaction($idAccount, 345);
        $tmpTransactions[] = $this->createTransaction($idAccount, 0);

        $apiResponse = $this->apiCall(
            'v1/transactions',
            'GET',
            [
                'type' => 'income'
            ]
        );
        foreach ($apiResponse['items'] as $item) {
            $this->assertGreaterThan(
                0,
                $item['sum'],
                'Transaction listing API, filtered by "type=income" wrongly returned "expense" transactions'
            );
        }
    }

    public function testFilteringByInvalidTypeError()
    {
        $FAKE_TYPE_FILTER = 'SOMETHING_RANDOM_NOT_EXISTING';
        $this->expectException(BadRequestHttpException::class);
        $this->apiCall(
            'v1/transactions',
            'GET',
            [
                'type' => $FAKE_TYPE_FILTER
            ]
        );
    }

    public function testAccountIdsFilterWithInvalidValuesError()
    {
        // Make sure there is some valid data to be
        // returned by the API... generally
        $account1     = $this->createAccount($this->baseUser->id);
        $transaction1 = $this->createTransaction($account1->id, 5);
        $account2     = $this->createAccount($this->baseUser->id);
        $transaction2 = $this->createTransaction($account2->id, 5);

        // SUT
        $this->expectException(ForbiddenHttpException::class);
        $this->apiCall(
            'v1/transactions',
            'GET',
            [
                'account_ids' => [
                    1,
                    5,
                    99,
                    -1,
                    rand(1, 1000)
                ]
            ]
        );

        // Cleanup
        $this->deleteTransaction($transaction1->id);
        $this->deleteTransaction($transaction2->id);
        $this->deleteAccount($account1->id);
        $this->deleteAccount($account2->id);
    }

    public function testAccountIdsFilterWithNotOwnedAccountIdsError()
    {
        $account1     = $this->createAccount($this->baseUser->id);
        $transaction1 = $this->createTransaction($account1->id, 5);
        $account2     = $this->createAccount($this->baseUser->id);
        $transaction2 = $this->createTransaction($account2->id, 5);

        $stranger            = $this->createUser();
        $strangerAccount     = $this->createAccount($stranger->id);
        $strangerTransaction = $this->createTransaction($strangerAccount->id);

        // SUT
        $this->expectException(ForbiddenHttpException::class);
        $this->apiCall(
            'v1/transactions',
            'GET',
            [
                'account_ids' => [
                    $account1->id,
                    $account2->id,

                    // This ID below should trigger a Forbidden API error
                    $strangerAccount->id,
                ]
            ]
        );

        // Cleanup
        $this->deleteUser($stranger->id);
    }

    public function testAccountIdsFilterWithValidValues()
    {

        // Create 2 accounts with some fake transactions in them
        $account1 = $this->createAccount($this->baseUser->id);
        $this->createTransaction($account1->id, 5);
        $this->createTransaction($account1->id, 5);
        $this->createTransaction($account1->id, 5);

        $account2 = $this->createAccount($this->baseUser->id);
        $this->createTransaction($account2->id, 5);
        $this->createTransaction($account2->id, 5);
        $this->createTransaction($account2->id, 5);

        $account3 = $this->createAccount($this->baseUser->id);
        $this->createTransaction($account3->id, 5);
        $this->createTransaction($account3->id, 5);
        $this->createTransaction($account3->id, 5);

        $items = $this->apiCall(
            'v1/transactions',
            'GET',
            [
                'account_ids' => [
                    $account1->id,
                    $account2->id,
                ]
            ]
        );
        foreach ($items['items'] as $item) {
            $this->assertTrue(
                in_array($item['account_id'], [$account1->id, $account2->id]),
                'Filtering by "account_id" - transactions from other accounts were returned'
            );
        }
    }

    public function testFilterAccountIdNotPassedAsArrayResultsInError()
    {
        $this->expectException(BadRequestHttpException::class);
        $this->apiCall(
            'v1/transactions',
            'GET',
            [
                'account_ids' => 'NOT AN ARRAY'
            ]
        );
    }

}