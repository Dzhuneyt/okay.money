<?php

use yii\web\User;



return [
    'vendorPath' => dirname(dirname(__DIR__)) . '/vendor',
    'components' => [
        'cache' => [
            'class' => 'yii\caching\DummyCache',
        ],
        'user' => [
            'class' => User::class
        ],
        'db' => [
            'class' => 'yii\db\Connection',
            'dsn' => 'mysql:dbname=' . getenv('MYSQL_DB') . ';host=' . getenv('MYSQL_HOST'),
            'username' => getenv('MYSQL_USER'),
            'password' => getenv('MYSQL_PASS'),
            'charset' => 'utf8',
        ],
        'mailer' => [
            'transport' => [
                'class' => 'Swift_SmtpTransport',
                'host' => getenv('MAILER_HOST'),  // e.g. smtp.mandrillapp.com or smtp.gmail.com
                'username' => getenv('MAILER_USERNAME'),
                'password' => getenv('MAILER_PASSWORD'),
                'port' => '587', // Port 25 is a very common port too
                'encryption' => 'tls', // It is often used, check your provider or mail server specs
            ],
        ],
    ],
];
