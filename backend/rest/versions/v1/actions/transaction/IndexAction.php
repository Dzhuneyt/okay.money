<?php

namespace rest\versions\v1\actions\transaction;

use common\models\Account;
use common\models\Category;
use common\models\Transaction;
use rest\versions\shared\helpers\BaseSqlDataProvider;
use Yii;
use yii\db\Query;
use yii\web\BadRequestHttpException;
use yii\web\ForbiddenHttpException;



class IndexAction extends \yii\rest\IndexAction
{
    public function validateParams()
    {
        $type = Yii::$app->request->getQueryParam('type');
        if (!empty($type) && !in_array($type, ['income', 'expense'])) {
            throw new BadRequestHttpException('Invalid parameter "type". Possible values: income, expense. Provided: ' . $type);
        }

        $accountIds = Yii::$app->request->getQueryParam('account_ids');
        if (!empty($accountIds)) {
            if (!is_array($accountIds)) {
                throw new BadRequestHttpException('Filter "account_ids" must be an array');
            }
            // API response is an error if the client tries to filter
            // by non existing or not owned account IDs
            $ownedAccountIds = Account::find()
                                      ->where([
                                          'id' => $accountIds,
                                          'owner_id' => Yii::$app->user->id,
                                      ])
                                      ->select('id')
                                      ->column();

            $notOwnedAccountIds = array_diff($accountIds, $ownedAccountIds);

            if (!empty($notOwnedAccountIds)) {
                throw new ForbiddenHttpException(
                    'The filter "account_ids" included some invalid values: '
                    . implode(', ', $notOwnedAccountIds));
            }
        }
    }

    public function run()
    {
        $this->validateParams();

        return parent::run();
    }

    private function getBaseQuery()
    {
        return (new Query())
            ->select([
                't.*',
                'account_name' => 'a.name',
                'category_name' => 'c.name',
            ])
            ->from(Transaction::tableName() . ' t')
            ->innerJoin(
                [
                    // Get account of transactions
                    'a' => Account::tableName()
                ],
                // Get account of each transaction
                't.account_id=a.id AND owner_id=:idUser',
                [
                    // Params for JOIN
                    ':idUser' => Yii::$app->user->id
                ]
            )
            ->innerJoin(
                [
                    // Get category of transaction
                    'c' => Category::tableName()
                ],
                't.category_id=c.id'
            );
    }

    protected function prepareDataProvider()
    {
        $requestParams = Yii::$app->getRequest()
                                  ->getBodyParams();
        if (empty($requestParams)) {
            $requestParams = Yii::$app->getRequest()
                                      ->getQueryParams();
        }

        /**
         * @var Query
         */
        $query = $this->getBaseQuery();

        $query = $this->applyFiltersToQuery($query);

        return Yii::createObject([
            'class' => BaseSqlDataProvider::class,
            'rowFormatter' => function ($row) {
                $row['category'] = [
                    'id' => $row['category_id'],
                    'name' => $row['category_name'],
                ];
                $row['account'] = [
                    'id' => $row['account_id'],
                    'name' => $row['account_name'],
                ];

                unset(
                    $row['category_id'],
                    $row['category_name'],
                    $row['account_id'],
                    $row['account_name']
                );

                return $row;
            },
            'sql' => $query->createCommand()
                           ->getRawSql(),
            'pagination' => [
                'params' => $requestParams,
            ],
            'sort' => [
                'attributes' => [
                    'created_at',
                    'id'
                ],
                'defaultOrder' => [
                    'created_at' => SORT_DESC
                ],
                'params' => $requestParams,
            ],
        ]);
    }

    private function applyFiltersToQuery(Query $query): Query
    {
        $type = Yii::$app->request->getQueryParam('type');
        switch ($type) {
            case 'income':
                $query->andWhere('t.sum > 0');
                break;
            case 'expense':
                $query->andWhere('t.sum < 0');
                break;
        }

        $accountIds = Yii::$app->request->getQueryParam('account_ids');
        if (!empty($accountIds) && is_array($accountIds)) {
            $query->andWhere(['account_id' => $accountIds]);
        }

        return $query;
    }

}
