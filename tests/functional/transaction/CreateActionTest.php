<?php

namespace tests\functional\transaction;


use common\models\Account;
use common\models\Transaction;
use common\models\User;
use tests\functional\FunctionalTestCase;
use yii\db\Query;
use yii\web\BadRequestHttpException;
use yii\web\UnauthorizedHttpException;

class CreateActionTest extends FunctionalTestCase
{

    /**
     * @var User
     */
    private $user;

    /**
     * @var Account
     */
    private $account;

    protected function setUp()
    {
        parent::setUp();

        $this->user    = $this->createUser();
        $this->account = $this->createAccount($this->user->id);
        $this->loginAsUser($this->user->id);
    }

    protected function tearDown()
    {
        $this->deleteAccount($this->account->id);
        $this->deleteUser($this->user->id);
        parent::tearDown();
    }

    public function testCreateTransactionSuccess()
    {
        $transaction = $this->apiCall('v1/transactions', 'POST', [
            'sum'         => 5,
            'description' => $this->faker->text(),
            'account_id'  => $this->account->id
        ]);
        $this->assertNotNull($transaction['id'], 'Transaction can not be created');

        // Cleanup
        $this->deleteTransaction($transaction['id']);
    }

    public function testCanNotCreateTransactionsAnonymously()
    {
        $this->logout();
        $this->expectException(UnauthorizedHttpException::class);
        $this->apiCall('v1/transactions', 'POST', [
            'sum'         => 9.99,
            'description' => $this->faker->text(),
            'account_id'  => $this->account->id
        ]);
    }

    public function testCanCreateTransactionWithFloatValue()
    {
        $TRANSACTION_SUM_FLOAT = 123.45;

        $transaction = $this->apiCall('v1/transactions', 'POST', [
            'sum'         => $TRANSACTION_SUM_FLOAT,
            'description' => $this->faker->text(),
            'account_id'  => $this->account->id
        ]);

        $actualValue = (new Query())
            ->select('sum')
            ->from(Transaction::tableName())
            ->where(['id' => $transaction['id']])
            ->scalar();

        $this->assertEquals(
            floatval($TRANSACTION_SUM_FLOAT),
            floatval($actualValue),
            'Transaction sum passed to the API is not accurately saved to transactions->sum DB column'
        );

        // Cleanup
        $this->deleteTransaction($transaction['id']);
    }

    public function testTransactionGoesInCorrectAccount()
    {
        $ACCOUNT_ID = $this->account->id;

        $transaction = $this->apiCall('v1/transactions', 'POST', [
            'sum'         => 5,
            'description' => $this->faker->text(),
            'account_id'  => $ACCOUNT_ID
        ]);

        $actualValue = (new Query())
            ->select('account_id')
            ->from(Transaction::tableName())
            ->where(['id' => $transaction['id']])
            ->scalar();

        $this->assertEquals(
            intval($ACCOUNT_ID),
            intval($actualValue),
            'Transaction was not saved in the account ID that was passed to the API'
        );

        // Cleanup
        $this->deleteTransaction($transaction['id']);
    }

    public function testTransactionTextIsSaved()
    {
        $TRANSACTION_TEXT = 'SAMPLE TRANSACTION TEXT';

        $transaction = $this->apiCall('v1/transactions', 'POST', [
            'sum'         => 5,
            'description' => $TRANSACTION_TEXT,
            'account_id'  => $this->account->id
        ]);

        $actualValue = (new Query())
            ->select('description')
            ->from(Transaction::tableName())
            ->where(['id' => $transaction['id']])
            ->scalar();

        $this->assertEquals(
            $TRANSACTION_TEXT,
            $actualValue,
            'Transaction description was not correctly saved to DB'
        );

        // Cleanup
        $this->deleteTransaction($transaction['id']);
    }

    public function testCanNotCreateTransactionWithoutSum()
    {
        $this->expectException(BadRequestHttpException::class);
        $this->apiCall('v1/transactions', 'POST', [
            'description' => $this->faker->text(),
            'account_id'  => $this->account->id
        ]);
    }

    public function testCanNotCreateTransactionWithNegativeSum()
    {
        $this->expectException(BadRequestHttpException::class);
        $this->apiCall('v1/transactions', 'POST', [
            'description' => $this->faker->text(),
            'account_id'  => $this->account->id,
            'sum'         => -1,
        ]);
    }

    public function testCanNotCreateTransactionInNonExistingAccount()
    {
        $this->expectException(UnauthorizedHttpException::class);
        $this->apiCall('v1/transactions', 'POST', [
            'description' => $this->faker->text(),
            'account_id'  => 0,
            'sum'         => 5,
        ]);
    }

    public function testCanNotCreateTransactionInAnotherUserAccount()
    {
        // Prerequisites
        // Create a second user and an account for that user
        $user2   = $this->createUser();
        $account = $this->createAccount($user2->id);

        // Assertions
        $this->expectException(UnauthorizedHttpException::class);

        // Try to create a transaction with USER 1
        // but attach the transaction to the account of USER 2
        $this->apiCall('v1/transactions', 'POST', [
            'description' => $this->faker->text(),
            'account_id'  => $account->id,
            'sum'         => 5,
        ]);

        // Cleanup
        $this->deleteAccount($account->id);
        $this->deleteUser($user2->id);
    }

}