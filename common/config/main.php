<?php
return [
    'vendorPath' => dirname(dirname(__DIR__)) . '/vendor',
    'components' => [
        'cache' => [
            'class' => 'yii\caching\DummyCache',
        ],
        'user'=>[
            'class'=>\yii\web\User::class
        ],
    ],
];
