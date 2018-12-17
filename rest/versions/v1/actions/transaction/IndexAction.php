<?php

namespace rest\versions\v1\actions\transaction;

use common\models\Account;
use common\models\Transaction;
use rest\versions\shared\helpers\BaseDataProvider;
use Yii;

class IndexAction extends \yii\rest\IndexAction
{

    protected function prepareDataProvider()
    {
        $requestParams = Yii::$app->getRequest()->getBodyParams();
        if (empty($requestParams)) {
            $requestParams = Yii::$app->getRequest()->getQueryParams();
        }

        $query = Transaction::find()->alias('t')
            ->innerJoin(['a' => Account::tableName()], 't.account_id=a.id AND owner_id=:idUser',
                [':idUser' => Yii::$app->user->id])
            // Get only the transactions from accounts of the current user
            ->andWhere(['owner_id' => Yii::$app->user->id]);

        return Yii::createObject([
            'class' => BaseDataProvider::class,
            'rowFormatter' => function ($row) {
                return $row;
            },
            'query' => $query,
            'pagination' => [
                'params' => $requestParams,
            ],
            'sort' => [
                'params' => $requestParams,
            ],
        ]);
    }

}