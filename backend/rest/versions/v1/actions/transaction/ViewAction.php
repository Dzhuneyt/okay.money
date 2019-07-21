<?php

namespace rest\versions\v1\actions\transaction;

use common\models\Transaction;



class ViewAction extends \yii\rest\ViewAction
{

    public function run($id)
    {
        $model = parent::run($id);
        /**
         * @var $model Transaction
         */

        $response = $model->getAttributes();
        $response['category'] = $model->category->getAttributes(['id', 'name']);
        $response['account'] = $model->account->getAttributes(['id', 'name']);

        return $response;
    }

}
