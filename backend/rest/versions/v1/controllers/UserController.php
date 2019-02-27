<?php

namespace rest\versions\v1\controllers;

use rest\versions\v1\actions\user\LoginAction;
use yii\rest\Controller;

/**
 * Class UserController
 * @package rest\versions\v1\controllers
 */
class UserController extends Controller
{

    public function actions()
    {
        return [
            'login' => [
                'class' => LoginAction::class,
            ],
        ];
    }

}
