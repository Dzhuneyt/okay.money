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
     * @return string AuthKey or model with errors
     * @throws \yii\base\InvalidConfigException
     */
    public function actionLogin()
    {
        $model = new Login();

        if ($model->load(\Yii::$app->getRequest()->getBodyParams(), '') && $model->login()) {
            return \Yii::$app->user->identity->getAuthKey();
        } else {
            return $model;
        }
    }

    public function actionRegister()
    {
    }
}
