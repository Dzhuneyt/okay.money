<?php

namespace rest\versions\v1\controllers;

use rest\versions\v1\actions\user\LoginAction;
use rest\versions\v1\actions\user\ProfileAction;
use rest\versions\v1\actions\user\ProfileGetAction;
use yii\filters\auth\QueryParamAuth;
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
            ],
            'authenticator' => [
                'class' => QueryParamAuth::class,
                'except' => [
                    'options',
                    'login',
                ]
            ],
        ]);
    }

    public function actions()
    {
        return [
            'login' => [
                'class' => LoginAction::class,
            ],
            'profile' => [
                'class' => ProfileAction::class,
            ],
            'profile_get' => [
                'class' => ProfileGetAction::class,
            ],
            'options' => [
                'class' => OptionsAction::class,
            ]
        ];
    }

}
