<?php
$params = array_merge(
    requireIfExists(__DIR__ . '/../../common/config/params.php'),
    requireIfExists(__DIR__ . '/../../common/config/params-local.php'),
    requireIfExists(__DIR__ . '/params.php'),
    requireIfExists(__DIR__ . '/params-local.php')
);
return [
    'id' => 'app-console',
    'basePath' => dirname(__DIR__),
    'bootstrap' => ['log', 'gii'],
    'controllerNamespace' => 'console\controllers',
    'controllerMap' => [
        'fixture' => \console\controllers\FixtureController::class,
    ],
    'modules' => [
        'gii' => 'yii\gii\Module',
    ],
    'components' => [
        'log' => [
            'targets' => [
                [
                    'class' => 'yii\log\FileTarget',
                    'levels' => ['error', 'warning'],
                ],
            ],
        ],
    ],
    'params' => $params,
];
