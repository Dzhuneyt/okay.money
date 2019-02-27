<?php

namespace rest\versions\v1\controllers;

use rest\versions\v1\actions\user\LoginAction;
use yii\filters\Cors;
use yii\rest\Controller;
use yii\rest\OptionsAction;

/**
 * Class UserController
 * @package rest\versions\v1\controllers
 */
class UserController extends Controller
{

    public function behaviors()
    {
        return array_merge(parent::behaviors(), [
            'cors' => [
                'class' => Cors::class,
            ]
        ]);
    }

    public function actions()
    {
        return [
            'login' => [
                'class' => LoginAction::class,
            ],
            'options' => [
                'class' => OptionsAction::class,
            ]
        ];
    }

}
