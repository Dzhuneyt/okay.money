<?php

namespace rest\versions\shared\controllers;


use yii\filters\auth\QueryParamAuth;
use yii\web\NotFoundHttpException;

class ActiveController extends \yii\rest\ActiveController
{

    /**
     * By setting this, we are always wrapping the response
     * array in an "items" prefixed key. Otherwise, Yii returns
     * the array directly at the root of the response body
     * @var array
     */
    public $serializer = [
        'class'              => 'yii\rest\Serializer',
        'collectionEnvelope' => 'items',
    ];

    public function actions()
    {
        $actions = parent::actions();

        foreach ($actions as $i => $action) {
            if ($i === 'options') {
                continue;
            }
            $actions[$i]['checkAccess'] = function () {
                throw new NotFoundHttpException('Not implemented');
            };
        }

        return $actions;
    }

    public function behaviors()
    {
        $behaviors                  = parent::behaviors();
        $behaviors['authenticator'] = [
            'class' => QueryParamAuth::class,
        ];

        return $behaviors;
    }
}