<?php

namespace tests\functional\transaction;


use common\models\Account;
use common\models\Category;
use common\models\Transaction;
use common\models\User;
use tests\functional\FunctionalTestCase;
use yii\base\Exception;
use yii\db\Query;
use yii\web\BadRequestHttpException;
use yii\web\ForbiddenHttpException;
use yii\web\NotFoundHttpException;
use yii\web\ServerErrorHttpException;
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

    /**
     * @var Category
     */
    private $category;

    protected function setUp()
    {
        parent::setUp();

        $this->account = $this->createAccount($this->baseUser->id);
        $this->category = $this->createCategory($this->baseUser->id);

        $this->loginAsUser($this->baseUser->id);
    }

    protected function tearDown()
    {
        $this->deleteAccount($this->account->id);
        parent::tearDown();
    }

    public function testCreateTransactionSuccess()
    {
        $category = $this->createCategory($this->baseUser->id);

        $transaction = $this->apiCall('v1/transactions', 'POST', [
            'sum' => 5,
            'description' => $this->faker->text(),
            'account_id' => $this->account->id,
            'category_id' => $category->id,
        ]);
        $this->assertNotNull($transaction['id'], 'Transaction can not be created');
    }

    public function testCanNotCreateTransactionsWithoutCategory()
    {
        $this->expectException(BadRequestHttpException::class);
        $this->apiCall('v1/transactions', 'POST', [
            'sum' => 5,
            'description' => $this->faker->text(),
            'account_id' => $this->account->id
        ]);
    }

    public function testCanNotCreateTransactionsAnonymously()
    {
        $this->logout();
        $this->expectException(UnauthorizedHttpException::class);
        $this->apiCall('v1/transactions', 'POST', [
            'sum' => 9.99,
            'description' => $this->faker->text(),
            'account_id' => $this->account->id
        ]);
    }

    /**
     * @depends testCreateTransactionSuccess
     * @throws ForbiddenHttpException
     * @throws Exception
     * @throws NotFoundHttpException
     * @throws ServerErrorHttpException
     */
    public function testCanCreateTransactionWithFloatValue()
    {
        $TRANSACTION_SUM_FLOAT = 123.45;
        $transaction = $this->apiCall('v1/transactions', 'POST', [
            'sum' => $TRANSACTION_SUM_FLOAT,
            'description' => $this->faker->text(),
            'account_id' => $this->account->id,
            'category_id' => $this->category->id,
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

    /**
     * @depends testCreateTransactionSuccess
     * @throws ForbiddenHttpException
     * @throws Exception
     * @throws NotFoundHttpException
     * @throws ServerErrorHttpException
     */
    public function testTransactionGoesInCorrectAccount()
    {
        $ACCOUNT_ID = $this->account->id;

        $transaction = $this->apiCall('v1/transactions', 'POST', [
            'sum' => 5,
            'description' => $this->faker->text(),
            'account_id' => $ACCOUNT_ID,
            'category_id' => $this->category->id,
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

    /**
     * @depends testCreateTransactionSuccess
     * @throws ForbiddenHttpException
     * @throws Exception
     * @throws NotFoundHttpException
     * @throws ServerErrorHttpException
     */
    public function testTransactionTextIsSaved()
    {
        $TRANSACTION_TEXT = 'SAMPLE TRANSACTION TEXT';

        $transaction = $this->apiCall('v1/transactions', 'POST', [
            'sum' => 5,
            'description' => $TRANSACTION_TEXT,
            'account_id' => $this->account->id,
            'category_id' => $this->category->id,
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
            'account_id' => $this->account->id
        ]);
    }

    public function testCanNotCreateTransactionInNonExistingAccount()
    {
        $this->expectException(ForbiddenHttpException::class);
        $this->apiCall('v1/transactions', 'POST', [
            'description' => $this->faker->text(),
            'account_id' => 0,
            'sum' => 5,
        ]);
    }

    public function testCanNotCreateTransactionInAnotherUserAccount()
    {
        // Prerequisites
        // Create a second user and an account for that user
        $user2 = $this->createUser();
        $account = $this->createAccount($user2->id);

        // Assertions
        $this->expectException(ForbiddenHttpException::class);

        // Try to create a transaction with USER 1
        // but attach the transaction to the account of USER 2
        try {
            $this->apiCall('v1/transactions', 'POST', [
                'description' => $this->faker->text(),
                'account_id' => $account->id,
                'sum' => 5,
            ]);
        } finally {
            // Cleanup
            $this->deleteAccount($account->id);
            $this->deleteUser($user2->id);
        }
    }

    public function testCanCreateTransactionWithMyCategoryId()
    {
        $category = $this->createCategory($this->baseUser->id);

        $transaction = $this->apiCall('v1/transactions', 'POST', [
            'sum' => 5,
            'description' => $this->faker->text(),
            'account_id' => $this->account->id,
            'category_id' => $category->id,
        ]);

        $actualTransaction = Transaction::findOne($transaction['id']);
        $this->assertEquals($category->id, $actualTransaction->category_id,
            'Transaction created with category ID but the actual category ID in DB saved differently');

        // Cleanup
        $this->deleteTransaction($transaction['id']);
        $this->deleteCategory($category->id);
    }

    public function testCanNotCreateTransactionWithNonExistingCategory()
    {
        $this->expectException(ForbiddenHttpException::class);
        $this->apiCall('v1/transactions', 'POST', [
            'sum' => 5,
            'description' => $this->faker->text(),
            'account_id' => $this->account->id,
            'category_id' => -1,
        ]);
    }

    public function testCanNotCreateTransactionWithOtherPeopleCategory()
    {
        // Prerequisites
        $stranger = $this->createUser();
        $strangerCategory = $this->createCategory($stranger->id);

        // SUT
        $this->expectException(ForbiddenHttpException::class);
        $this->apiCall('v1/transactions', 'POST', [
            'sum' => 5,
            'description' => $this->faker->text(),
            'account_id' => $this->account->id,
            'category_id' => $strangerCategory->id,
        ]);
        // Cleanup
        $this->deleteCategory($strangerCategory->id);
        $this->deleteUser($stranger->id);
    }

}
