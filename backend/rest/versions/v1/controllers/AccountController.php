<?php

namespace rest\versions\v1\controllers;


use common\models\Account;
use rest\versions\v1\actions\account\CreateAction;
use rest\versions\v1\actions\account\IndexAction;
use Yii;
use yii\helpers\ArrayHelper;
use yii\web\ForbiddenHttpException;

class AccountController extends \rest\versions\shared\controllers\ActiveController
{

    public $modelClass = 'common\models\Account';

    public function checkAccess($action, $model = null, $params = [])
    {
        switch ($action) {
            case 'options':
                return true;
                break;
            case 'delete':
            case 'view':
                // Prevent getting or deleting other people's accounts
                /** @var $model Account */
                if ($model && $model->owner_id !== Yii::$app->getUser()->id) {
                    throw new ForbiddenHttpException();
                }
                break;
            case 'create':
            case 'index':
                // Anyone can create accounts
                return true;
                break;
        }
        parent::checkAccess($action, $model, $params);
    }

    public function actions()
    {
        $actions = ArrayHelper::merge(
            parent::actions(),
            [
                'index' => [
                    'class' => IndexAction::class,
                    'checkAccess' => null,
                ],
                'create' => [
                    'class' => CreateAction::class,
                    'checkAccess' => null,
                ],
                'delete' => [
                    'checkAccess' => function ($action, $model = null, $params = []) {
                        return $this->checkAccess($action, $model, $params);
                    }
                ],
                'update' => [
                    'checkAccess' => function ($action, $model = null, $params = []) {
                        return $this->checkAccess($action, $model, $params);
                    }
                ],
                'view' => [
                    'checkAccess' => function ($action, $model = null, $params = []) {
                        return $this->checkAccess($action, $model, $params);
                    }
                ]
            ]
        );

        return $actions;
    }
}
