<?php

namespace rest\versions\v1\actions\account;

use common\models\Account;
use Yii;
use yii\helpers\Url;
use yii\web\ServerErrorHttpException;

class CreateAction extends \yii\rest\CreateAction
{

    public function run()
    {
        if ($this->checkAccess) {
            call_user_func($this->checkAccess, $this->id);
        }

        /* @var $model Account */
        $model = new $this->modelClass([
            'scenario' => $this->scenario,
        ]);

        $params = Yii::$app->getRequest()->getBodyParams();

        if (empty($params['starting_balance'])) {
            $params['starting_balance'] = 0;
        }

        $model->load($params, '');
        $model->owner_id = Yii::$app->getUser()->id;
        if ($model->save()) {
            $response = Yii::$app->getResponse();
            $response->setStatusCode(201);
            $id = implode(',', array_values($model->getPrimaryKey(true)));
            $response->getHeaders()->set('Location', Url::toRoute([$this->viewAction, 'id' => $id], true));
        } elseif ( ! $model->hasErrors()) {
            throw new ServerErrorHttpException('Failed to create the object for unknown reason.');
        }

        return $model;
    }
}