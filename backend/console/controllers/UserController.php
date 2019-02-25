<?php
/**
 * Created by PhpStorm.
 * User: ubuntu
 * Date: 2/25/19
 * Time: 6:38 PM
 */

namespace console\controllers;


use common\models\User;
use yii\console\Controller;
use yii\console\ExitCode;

class UserController extends Controller
{

    public function actionCreate($username, $password)
    {
        $user = new \common\models\User();
        $user->username = $username;
        $user->setPassword($password);
        $user->generateAuthKey();
        if ($user->save()) {
            echo 'User created';
            return ExitCode::OK;
        } else {
            echo 'User failed to be created';
            print_r($user->getErrors());
            return ExitCode::UNSPECIFIED_ERROR;
        }
    }

    public function actionDelete($idOrUserName)
    {
        User::deleteAll(['id' => $idOrUserName]);
        User::deleteAll(['username' => $idOrUserName]);
    }

    public function actionGetAuthKey($idUserOrUsername)
    {
        $user = User::find()
            ->andWhere('id=:search OR username=:search', [
                ':search' => $idUserOrUsername
            ])
            ->select('auth_key')
            ->scalar();
        echo $user;
    }

}
