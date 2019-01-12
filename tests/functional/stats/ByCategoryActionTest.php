<?php

namespace tests\functional\category;


use common\models\Account;
use common\models\Category;
use common\models\Transaction;
use tests\functional\FunctionalTestCase;
use yii\db\Expression;
use yii\web\BadRequestHttpException;
use yii\web\UnauthorizedHttpException;

class ByCategoryActionTest extends FunctionalTestCase
{
    protected function setUp()
    {
        parent::setUp();
        $this->loginAsUser($this->baseUser->id);

        Transaction::deleteAll();
        Category::deleteAll();
        Account::deleteAll();
    }

    public function testCanNotGetStatsAnonymously()
    {
        $this->logout();
        $this->expectException(UnauthorizedHttpException::class);
        $this->apiCall('v1/stats/by_category', 'GET');
    }

    public function testCanGetMyStats()
    {
        $result = $this->apiCall('v1/stats/by_category', 'GET');
        $this->assertArrayHasKey('categories', $result);
    }

    /**
     * @throws \yii\base\Exception
     * @throws \yii\web\ForbiddenHttpException
     * @throws \yii\web\NotFoundHttpException
     * @throws \yii\web\ServerErrorHttpException
     * @depends testCanGetMyStats
     */
    public function testCanNotGetStatsForOtherUsersCategories()
    {

        // Prerequisites. Prepare fake data
        $stranger         = $this->createUser();
        $strangerCategory = $this->createCategory($stranger->id);
        $strangerAccount  = $this->createAccount($stranger->id);
        $this->createTransaction($strangerAccount->id, null, $strangerCategory->id);
        $this->createTransaction($strangerAccount->id, null, $strangerCategory->id);
        $this->createTransaction($strangerAccount->id, null, $strangerCategory->id);

        $this->_seedSomeTransactionsInAccount();

        // SUT
        $result = $this->apiCall(
            'v1/stats/by_category',
            'GET'
        );

        // Assertions
        $myCategoriesIds = Category::find()
                                   ->select('id')
                                   ->andWhere(['owner_id' => $this->baseUser->id])
                                   ->column();

        foreach ($result['categories'] as $category) {
            $this->assertTrue(
                in_array($category['id'], $myCategoriesIds),
                'Stats API returned stats for categories that are not mine'
            );
        }

        $this->deleteUser($stranger->id);
    }

    /**
     * @return bool
     * @throws \yii\base\Exception
     * @throws \yii\web\ForbiddenHttpException
     * @throws \yii\web\NotFoundHttpException
     * @throws \yii\web\ServerErrorHttpException
     * @depends testCanGetMyStats
     */
    public function testReturnsCorrectExpensesForEachCategory()
    {
        $myCategory = $this->_seedSomeTransactionsInAccount();

        // SUT
        $result = $this->apiCall('v1/stats/by_category', 'GET');

        foreach ($result['categories'] as $category) {
            if ($category['id'] == $myCategory->id) {
                $this->assertEquals(-8, $category['expense_for_period']);

                return true;
            }
        }
        $this->fail('My category not returned in stats API');
    }

    /**
     * @return bool
     * @throws \yii\base\Exception
     * @throws \yii\web\ForbiddenHttpException
     * @throws \yii\web\NotFoundHttpException
     * @throws \yii\web\ServerErrorHttpException
     * @depends testCanGetMyStats
     */
    public function testReturnsCorrectIncomesForEachCategory()
    {
        $myCategory = $this->_seedSomeTransactionsInAccount();

        // SUT
        $result = $this->apiCall('v1/stats/by_category', 'GET');

        foreach ($result['categories'] as $category) {
            if ($category['id'] == $myCategory->id) {
                $this->assertEquals(5, $category['income_for_period']);

                return true;
            }
        }
        $this->fail('My category not returned in stats API');
    }

    /**
     * @throws \yii\base\Exception
     * @throws \yii\web\ForbiddenHttpException
     * @throws \yii\web\NotFoundHttpException
     * @throws \yii\web\ServerErrorHttpException
     * @depends testCanGetMyStats
     */
    public function testCategoriesCountIsExact()
    {
        $NUM_CATEGORIES_CREATED = 4;
        for ($i = 0; $i < $NUM_CATEGORIES_CREATED; $i++) {
            $this->createCategory($this->baseUser->id);
        }

        // SUT
        $result = $this->apiCall('v1/stats/by_category', 'GET');
        $this->assertCount($NUM_CATEGORIES_CREATED, $result['categories']);
    }

    /**
     * @return bool
     * @throws \yii\base\Exception
     * @throws \yii\web\ForbiddenHttpException
     * @throws \yii\web\NotFoundHttpException
     * @throws \yii\web\ServerErrorHttpException
     * @depends testCanGetMyStats
     */
    public function testCategoryWithZeroBalance()
    {
        $category = $this->createCategory($this->baseUser->id);

        // SUT
        $result = $this->apiCall('v1/stats/by_category', 'GET');

        foreach ($result['categories'] as $c) {
            if ($c['id'] == $category->id) {
                $this->assertEquals(0, $c['income_for_period']);
                $this->assertEquals(0, $c['expense_for_period']);

                return true;
            }
        }
    }

    public function testInvalidStartDate()
    {
        $this->expectException(BadRequestHttpException::class);
        $this->expectExceptionMessageRegExp('(start_date)');
        $this->apiCall('v1/stats/by_category', 'GET', [
            'start_date' => 'something_random',
        ]);
    }

    public function testInvalidEndDate()
    {
        $this->expectException(BadRequestHttpException::class);
        $this->expectExceptionMessageRegExp('(end_date)');
        $this->apiCall('v1/stats/by_category', 'GET', [
            'end_date' => 'something_random',
        ]);
    }

    public function testFilterStartDate()
    {
        $SUM_INCLUDED_IN_FILTER   = 3 + 3 + 3;
        $SUM_EXCLUDED_FROM_FILTER = 18;

        $account  = $this->createAccount($this->baseUser->id);
        $category = $this->createCategory($this->baseUser->id);

        // Create a transaction that is some time before the filtered "start_date"
        // This transaction should be EXCLUDED from the API response
        $transactionBefore             = $this->createTransaction($account->id, $SUM_EXCLUDED_FROM_FILTER,
            $category->id);
        $transactionBefore->created_at = new Expression('UNIX_TIMESTAMP("2018-01-01 05:59:57")');
        $transactionBefore->save(false);
        $transactionBefore             = $this->createTransaction($account->id, $SUM_EXCLUDED_FROM_FILTER,
            $category->id);
        $transactionBefore->created_at = new Expression('UNIX_TIMESTAMP("2018-01-01 05:59:58")');
        $transactionBefore->save(false);
        $transactionBefore             = $this->createTransaction($account->id, $SUM_EXCLUDED_FROM_FILTER,
            $category->id);
        $transactionBefore->created_at = new Expression('UNIX_TIMESTAMP("2018-01-01 05:59:59")');
        $transactionBefore->save(false);

        // Create a transaction that is some time after the filtered "start_date"
        // This transaction should be INCLUDED in the API response
        $transactionAfter             = $this->createTransaction($account->id, 3, $category->id);
        $transactionAfter->created_at = new Expression('UNIX_TIMESTAMP("2018-01-01 06:00:01")');
        $transactionAfter->save(false);
        $transactionAfter             = $this->createTransaction($account->id, 3, $category->id);
        $transactionAfter->created_at = new Expression('UNIX_TIMESTAMP("2018-01-01 06:00:02")');
        $transactionAfter->save(false);
        $transactionAfter             = $this->createTransaction($account->id, 3, $category->id);
        $transactionAfter->created_at = new Expression('UNIX_TIMESTAMP("2018-01-01 06:00:03")');
        $transactionAfter->save(false);


        $results = $this->apiCall('v1/stats/by_category', 'GET', [
            'start_date' => '2018-01-01 06:00:00',
        ]);

        foreach ($results['categories'] as $result) {
            if ($result['id'] == $category->id) {
                $this->assertEquals($SUM_INCLUDED_IN_FILTER, $result['income_for_period']);
            }
        }
    }

    /**
     * @throws \yii\base\Exception
     * @throws \yii\web\ForbiddenHttpException
     * @throws \yii\web\NotFoundHttpException
     * @throws \yii\web\ServerErrorHttpException
     */
    public function testFilterEndDate()
    {
        $INCOMES_IN_DATE_RANGE      = 99;
        $EXPENSES_IN_DATE_RANGE     = -13;
        $INCOMES_OUTSIDE_DATE_RANGE = 15;

        $account  = $this->createAccount($this->baseUser->id);
        $category = $this->createCategory($this->baseUser->id);

        // Create a transaction that is some time before the filtered "end_date"
        // This transaction should be INCLUDED from the API response
        $transactionInRange             = $this->createTransaction(
            $account->id,
            $INCOMES_IN_DATE_RANGE,
            $category->id
        );
        $transactionInRange->created_at = new Expression('UNIX_TIMESTAMP("2018-01-01 05:59:57")');
        $transactionInRange->save(false);

        $transactionInRange             = $this->createTransaction(
            $account->id,
            $EXPENSES_IN_DATE_RANGE,
            $category->id
        );
        $transactionInRange->created_at = new Expression('UNIX_TIMESTAMP("2018-01-01 05:59:57")');
        $transactionInRange->save(false);

        // Create a transaction that is some time after the filtered "end_date"
        // This transaction should be EXCLUDED in the API response
        $transactionOutsideRange             = $this->createTransaction(
            $account->id,
            $INCOMES_OUTSIDE_DATE_RANGE,
            $category->id);
        $transactionOutsideRange->created_at = new Expression('UNIX_TIMESTAMP("2018-01-01 06:00:01")');
        $transactionOutsideRange->save(false);

        // SUT
        $results = $this->apiCall('v1/stats/by_category', 'GET', [
            'end_date' => '2018-01-01 06:00:00',
        ]);

        // ASSERTIONS
        foreach ($results['categories'] as $result) {
            if ($result['id'] == $category->id) {
                $this->assertEquals(
                    $INCOMES_IN_DATE_RANGE,
                    $result['income_for_period'],
                    'Income stats for category were returned wrongly for the date range when the "date_end" filter was passed'
                );
                $this->assertEquals(
                    $EXPENSES_IN_DATE_RANGE,
                    $result['expense_for_period'],
                    'Expense stats for category were returned wrongly for the date range when the "date_end" filter was passed'
                );
            }
        }
    }

    public function testFilterStartDateAndEndDate()
    {
        $SUM_INCLUDED_IN_FILTER = 99.99;

        $account  = $this->createAccount($this->baseUser->id);
        $category = $this->createCategory($this->baseUser->id);

        // Create a transaction that is between the filtered timestamps (will be considered in API response)
        $transactionInsideRange             = $this->createTransaction(
            $account->id,
            $SUM_INCLUDED_IN_FILTER,
            $category->id
        );
        $transactionInsideRange->created_at = new Expression('UNIX_TIMESTAMP("2018-01-01 05:35:00")');
        $transactionInsideRange->save(false);

        // Create some more transactions that are outside of the filtered date range
        for ($i = 0; $i < 3; $i++) {
            $transactionOutsideRange             = $this->createTransaction(
                $account->id,
                null, // Random amount
                $category->id);
            $transactionOutsideRange->created_at = new Expression('UNIX_TIMESTAMP("2018-01-01 0' . rand(1,
                    3) . ':00:01")');
            $transactionOutsideRange->save(false);
        }
        for ($i = 0; $i < 3; $i++) {
            $transactionOutsideRange             = $this->createTransaction(
                $account->id,
                null, // Random amount
                $category->id);
            $transactionOutsideRange->created_at = new Expression('UNIX_TIMESTAMP("2018-01-01 0' . rand(7,
                    9) . ':00:01")');
            $transactionOutsideRange->save(false);
        }


        $results = $this->apiCall('v1/stats/by_category', 'GET', [
            // Include transactions only between 5 and 6 am
            'start_date' => '2018-01-01 05:00:00',
            'end_date'   => '2018-01-01 06:00:00',
        ]);

        foreach ($results['categories'] as $result) {
            if ($result['id'] == $category->id) {
                $this->assertEquals($SUM_INCLUDED_IN_FILTER, $result['income_for_period']);
            }
        }
    }

    /**
     * A helper method that will create a category for the
     * current user and create some fake transactions in that category
     * Used by a few of the test cases above so make sure to not change
     * the hardcoded numbers below
     *
     * @return Category
     * @throws \yii\base\Exception
     * @throws \yii\web\ForbiddenHttpException
     * @throws \yii\web\NotFoundHttpException
     * @throws \yii\web\ServerErrorHttpException
     */
    private function _seedSomeTransactionsInAccount(): Category
    {
        $myAccount  = $this->createAccount($this->baseUser->id);
        $myCategory = $this->createCategory($this->baseUser->id);
        $this->createTransaction($myAccount->id, -3, $myCategory->id);
        $this->createTransaction($myAccount->id, -5, $myCategory->id);
        $this->createTransaction($myAccount->id, 5, $myCategory->id);

        return $myCategory;
    }
}
