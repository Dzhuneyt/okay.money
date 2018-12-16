<?php
/**
 * Put the global test configuration here
 * Here you can override application components, modules, etc
 *
 * Local variables, like testing DB username/password should be
 * in the "unversioned" tests-local.php
 */
return [
    'components' => [
        'db' => [
            'class'    => 'yii\db\Connection',
            'dsn'      => 'mysql:host=127.0.0.1;dbname=personal_finance_test',
            'username' => 'root',
            'password' => '',
            'charset'  => 'utf8',
        ],
    ],
];