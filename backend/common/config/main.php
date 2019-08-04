<?php

use yii\web\User;



return [
    'vendorPath' => dirname(dirname(__DIR__)) . '/vendor',
    'components' => [
        'cache' => [
            'class' => 'yii\caching\DummyCache',
        ],
        'user'=>[
            'class' => User::class
        ],
        'db' => [
            'class' => 'yii\db\Connection',
            'dsn' => 'mysql:dbname=' . getenv('MYSQL_DB') . ';host=' . getenv('MYSQL_HOST'),
            'username' => getenv('MYSQL_USER'),
            'password' => getenv('MYSQL_PASS'),
            'charset' => 'utf8',
        ],
    ],
];
