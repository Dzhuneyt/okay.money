<?php

namespace rest\versions\v1\controllers;


use rest\versions\v1\actions\stats\ByCategoryAction;
use yii\filters\auth\QueryParamAuth;
use yii\rest\Controller;

class StatsController extends Controller
{

    public function actions()
    {
        return [
            'by_category' => [
                'class' => ByCategoryAction::class,
            ],
        ];
    }

    public function behaviors()
    {
        $behaviors = parent::behaviors();
        $behaviors['authenticator'] = [
            'class' => QueryParamAuth::class,
        ];

        return $behaviors;
    }
}
