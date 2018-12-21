<?php

namespace rest\versions\v1\actions\category;

use common\models\Account;
use common\models\Category;
use Yii;
use yii\helpers\Url;
use yii\web\ServerErrorHttpException;

class CreateAction extends \yii\rest\CreateAction
{

    public function createModel()
    {
        return new $this->modelClass([
            'scenario' => $this->scenario,
        ]);
    }

    public function run()
    {
        if ($this->checkAccess) {
            call_user_func($this->checkAccess, $this->id);
        }

        /* @var $model Account */
        $model = $this->createModel();

        $params = Yii::$app->getRequest()->getBodyParams();

        $model->load($params, '');
        $model->owner_id = Yii::$app->getUser()->id;
        if ($model->save()) {
            $model->refresh();
            $this->handleSuccess($model);
        } elseif (!$model->hasErrors()) {
            $this->handleError();
        }

        return $model;
    }

    public function handleError()
    {
        throw new ServerErrorHttpException('Failed to create the object for unknown reason.');
    }

    public function handleSuccess(Category &$model)
    {
        $response = Yii::$app->getResponse();
        $response->setStatusCode(201);
        $response->getHeaders()->set('Location', Url::toRoute([$this->viewAction, 'id' => $model->id], true));
    }
}