<?php

namespace rest\versions\v1\controllers;

use common\models\Login;
use yii\rest\Controller;

/**
 * Class UserController
 * @package rest\versions\v1\controllers
 */
class UserController extends Controller
{
    /**
     * This method implemented to demonstrate the receipt of the token.
     * Do not use it on production systems.
     * @return array with 'auth_key' (string) or 'errors' (array)
     * @throws \yii\base\InvalidConfigException
     */
    public function actionLogin()
    {
        $model = new Login();

        if ($model->load(\Yii::$app->getRequest()->getBodyParams(), '') && $model->login()) {
            return [
                'auth_key' => \Yii::$app->user->identity->getAuthKey()
            ];
        } else {
            return [
                'errors' => $model->getErrors()
            ];
        }
    }

    public function actionRegister()
    {
    }
}
