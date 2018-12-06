<?php

namespace rest\versions\shared\controllers;


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
}