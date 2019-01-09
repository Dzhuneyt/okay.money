<?php
/**
 * Local config for developer of environment.
 *
 * @author Evgeniy Tkachenko <et.coder@gmail.com>
 */

return [
    'language' => 'en',
    'components' => [
        'db' => [
            'class' => 'yii\db\Connection',
            'dsn' => 'mysql:dbname=circleci;host=127.0.0.1',
            'username' => 'root',
            'password' => '',
            'charset' => 'utf8',
        ],
    ],
];
