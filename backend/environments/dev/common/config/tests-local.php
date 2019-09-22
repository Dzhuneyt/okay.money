<?php
/**
 * Override your test DB configuration here
 * in order to be able to run functional tests
 */
return [
    'components' => [
        'db' => [
            'class' => 'yii\db\Connection',
            'dsn' => 'mysql:host=127.0.0.1;dbname=',
            'username' => '',
            'password' => '',
            'charset' => 'utf8',
        ]
    ]
];
