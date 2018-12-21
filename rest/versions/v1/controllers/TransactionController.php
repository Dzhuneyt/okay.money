<?php
/**
 * Created by PhpStorm.
 * User: Dzhuneyt
 * Date: 10.12.2018 г.
 * Time: 21:59
 */

namespace rest\versions\v1\controllers;


use common\models\Account;
use common\models\Transaction;
use rest\versions\shared\controllers\ActiveController;
use rest\versions\v1\actions\transaction\CreateAction;
use rest\versions\v1\actions\transaction\DeleteAction;
use rest\versions\v1\actions\transaction\IndexAction;
use rest\versions\v1\actions\transaction\UpdateAction;
use rest\versions\v1\actions\transaction\ViewAction;
use Yii;
use yii\helpers\ArrayHelper;
use yii\web\UnauthorizedHttpException;

class TransactionController extends ActiveController
{
    public $modelClass = Transaction::class;

    private function isMyTransaction($id)
    {
        $model = Transaction::findOne($id);

        if (!$model) {
            return false;
        }

        $account = Account::findOne($model->account_id);

        if (!$account || $account->owner_id != Yii::$app->user->id) {
            return false;
        }

        return true;
    }

    public function actions()
    {
        $actions = parent::actions();

        $checkAccess = function ($action, Transaction $model) {
            // Prevent touching other people's transaction
            if (!$this->isMyTransaction($model->id)) {
                throw new UnauthorizedHttpException();
            }
        };

        return ArrayHelper::merge($actions, [
            'create' => [
                'class' => CreateAction::class,
                'checkAccess' => null,
            ],
            'view' => [
                'class' => ViewAction::class,
                'checkAccess' => $checkAccess
            ],
            'update' => [
                'checkAccess' => $checkAccess,
            ],
            'delete' => [
                'checkAccess' => $checkAccess
            ],
            'index' => [
                'class' => IndexAction::class,
                'checkAccess' => null,
            ],
        ]);

    }
}