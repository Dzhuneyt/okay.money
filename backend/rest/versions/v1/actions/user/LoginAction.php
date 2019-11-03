<?php

namespace rest\versions\v1\actions\user;

use common\models\Login;
use common\models\User;
use yii\rest\Action;



class LoginAction extends Action
{
    public $modelClass = User::class;

    public function run()
    {
        $model = new Login();
        $model->load(
            \Yii::$app->getRequest()
                      ->getBodyParams(), '');

        if ($model->validate() && $model->login()) {
            return [
                'auth_key' => \Yii::$app->user->identity->getAuthKey()
            ];
        } else {
            return [
                'errors' => $model->getErrors()
            ];
        }
    }

}
