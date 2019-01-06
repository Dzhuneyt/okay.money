<?php
/**
 * Override DB connection credentials or all other parts of the application
 * that are useful to your local machine only. This file is not versioned
 */
return [
    'components' => [
        'db' => [
            'class'    => 'yii\db\Connection',
            'dsn'   => 'mysql:host=127.0.0.1;dbname=personal_finance_test',
            'username' => 'root',
            'password' => '',
            'charset'  => 'utf8',
        ],
    ],
];