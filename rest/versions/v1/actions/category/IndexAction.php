<?php

namespace rest\versions\v1\actions\category;


use common\models\Account;
use common\models\Category;
use common\models\Transaction;
use rest\versions\shared\helpers\BaseDataProvider;
use Yii;
use yii\db\Query;

class IndexAction extends \yii\rest\IndexAction
{

    protected function prepareDataProvider()
    {
        $requestParams = Yii::$app->getRequest()->getBodyParams();
        if (empty($requestParams)) {
            $requestParams = Yii::$app->getRequest()->getQueryParams();
        }

        $accountsBaseQuery = Category::find()
            // Get only the accounts of the current user
            ->andWhere(['owner_id' => Yii::$app->user->id]);


        return Yii::createObject([
            'class' => BaseDataProvider::class,
            'rowFormatter' => function ($row) {
                $row = $row->toArray();
                unset($row['owner_id']);

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