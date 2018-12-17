<?php

namespace rest\versions\v1\actions\transaction;


use common\models\Account;
use Yii;
use yii\db\Query;
use yii\web\BadRequestHttpException;
use yii\web\UnauthorizedHttpException;

class CreateAction extends \yii\rest\CreateAction
{


    public function init()
    {
        parent::init();

        $this->checkAccess = function () {
            $accountId = Yii::$app->request->getBodyParam('account_id');

            if (empty($accountId)) {
                throw new BadRequestHttpException('Invalid parameter "account_id"');
            }

            if (!$this->doesUserOwnAccount(Yii::$app->user->id, $accountId)) {
                throw new UnauthorizedHttpException(
                    'Can not create transactions in this account'
                );
            }
        };
    }

    private function validateParams($params = [])
    {
        if (empty($params['sum']) || floatval($params['sum']) <= 0) {
            throw new BadRequestHttpException('Invalid parameter "sum"');
        }
    }

    public function run()
    {
        call_user_func($this->checkAccess, $this->id);

        $params = \Yii::$app->request->getBodyParams();
        $params = $this->validateParams($params);

        return parent::run();
    }

    private function doesUserOwnAccount($idUser, $idAccount)
    {
        $account = Account::findOne($idAccount);
        if (!$account) {
            return false;
        }
        return intval($account->owner_id) === intval($idUser);
    }

}