<?php

namespace rest\versions\v1\controllers;

use common\models\LoginForm;
use rest\versions\shared\controllers\ActiveController;

/**
 * Class UserController
 * @package rest\versions\v1\controllers
 */
class UserController extends ActiveController
{
    /**
     * This method implemented to demonstrate the receipt of the token.
     * Do not use it on production systems.
     * @return string AuthKey or model with errors
     * @throws \yii\base\InvalidConfigException
     */
    public function actionLogin()
    {
        $model = new LoginForm();

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
