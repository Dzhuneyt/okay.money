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
            'dsn' => 'mysql:dbname=db;host=mysql',
            'username' => 'user',
            'password' => 'password',
            'charset' => 'utf8',
        ],
    ],
];
