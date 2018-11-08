<?php
/**
 * Created by PhpStorm.
 * User: Dzhuneyt
 * Date: 24.10.2018 г.
 * Time: 21:56
 */

namespace rest\versions\v1\controllers;


use common\models\Account;
use rest\versions\v1\actions\account\CreateAction;
use Yii;
use yii\filters\auth\QueryParamAuth;
use yii\helpers\ArrayHelper;
use yii\web\ForbiddenHttpException;

class AccountController extends \rest\versions\shared\controllers\ActiveController
{

    public $modelClass = 'common\models\Account';

    public function checkAccess($action, $model = null, $params = [])
    {
        switch ($action) {
            case 'delete':
                /** @var $model Account */
                if ($model && $model->owner_id !== Yii::$app->getUser()->id) {
                    throw new ForbiddenHttpException('You can only delete your own accounts');
                }
                break;
        }
        parent::checkAccess($action, $model, $params);
    }

    public function behaviors()
    {
        $behaviors                  = parent::behaviors();
        $behaviors['authenticator'] = [
            'class' => QueryParamAuth::class,
        ];

        return $behaviors;
    }

    public function actions()
    {
        return ArrayHelper::merge(
            parent::actions(),
            [
                'create' => [
                    'class'       => CreateAction::class,
                    'modelClass'  => $this->modelClass,
                    'checkAccess' => function ($action, $model = null, $params = []) {
                        return $this->checkAccess($action, $model, $params);
                    },
                    'scenario'    => $this->createScenario,
                ],
            ]
        );
    }
}