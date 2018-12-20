<?php

namespace rest\versions\v1\actions\account;


use common\models\Account;
use common\models\Transaction;
use rest\versions\shared\helpers\BaseDataProvider;
use Yii;
use yii\db\Query;

class IndexAction extends \yii\rest\IndexAction
{

    /**
     * @TODO move this to a dedicated helper
     * @return array
     */
    private function getMyAccountsBalances()
    {
        $myAccountIds = Account::find()
            // Get only the accounts of the current user
            ->select('id')
            ->andWhere(['owner_id' => Yii::$app->user->id])
            ->column();

        $accountBallances = (new Query())
            ->select('account_id, SUM(sum) AS sum')
            ->from(Transaction::tableName())
            ->where(['account_id' => $myAccountIds])
            ->groupBy('account_id')
            ->all();

        $findBallanceByAccountId = function ($accountId) use ($accountBallances) {
            foreach ($accountBallances as $ballanceRow) {
                if ($ballanceRow['account_id'] == $accountId) {
                    return floatval(number_format($ballanceRow['sum'], 2));
                }
            }
            return 0;
        };

        $res = [];
        foreach ($myAccountIds as $accountId) {
            $res[$accountId] = $findBallanceByAccountId($accountId);
        }
        return $res;
    }

    protected function prepareDataProvider()
    {
        $requestParams = Yii::$app->getRequest()->getBodyParams();
        if (empty($requestParams)) {
            $requestParams = Yii::$app->getRequest()->getQueryParams();
        }

        $accountsBaseQuery = Account::find()
            // Get only the accounts of the current user
            ->andWhere(['owner_id' => Yii::$app->user->id]);

        $accountBallances = $this->getMyAccountsBalances();

        return Yii::createObject([
            'class' => BaseDataProvider::class,
            'rowFormatter' => function ($row) use ($accountBallances) {
                $row = $row->toArray();
                unset($row['owner_id']);

                if (isset($accountBallances[$row['id']])) {
                    $row['current_balance'] = floatval($row['starting_balance']) + $accountBallances[$row['id']];
                }

                return $row;
            },
            'query' => $accountsBaseQuery,
            'pagination' => [
                'params' => $requestParams,
            ],
            'sort' => [
                'params' => $requestParams,
            ],
        ]);
    }

}