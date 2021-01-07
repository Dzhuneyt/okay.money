<?php

namespace rest\versions\v1\actions\user;

use common\models\Login;
use common\models\User;
use Yii;
use yii\rest\Action;
use yii\web\HttpException;



class ProfileGetAction extends Action
{
    public $modelClass = User::class;

    public function run()
    {
        return [
            'email' => Yii::$app->user->identity->email,
            'firstname' => Yii::$app->user->identity->firstname,
            'lastname' => Yii::$app->user->identity->lastname,
        ];
    }

}
