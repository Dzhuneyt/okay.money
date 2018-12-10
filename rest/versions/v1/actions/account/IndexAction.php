<?php

namespace rest\versions\v1\actions\account;


use common\models\Account;
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

        $query = Account::find()
            // Get only the accounts of the current user
                        ->andWhere(['owner_id' => Yii::$app->user->id]);

        return Yii::createObject([
            'class'        => BaseDataProvider::class,
            'rowFormatter' => function ($row) {
                unset($row['owner_id']);

                return $row;
            },
            'query'        => $query,
            'pagination'   => [
                'params' => $requestParams,
            ],
            'sort'         => [
                'params' => $requestParams,
            ],
        ]);
    }

}