<?php

$params = array_merge(
    requireIfExists(__DIR__ . '/../../common/config/params.php'),
    requireIfExists(__DIR__ . '/../../common/config/params-local.php'),
    requireIfExists(__DIR__ . '/params.php'),
    requireIfExists(__DIR__ . '/params-local.php')
);

return [
    'id'         => 'rest-api',
    'basePath'   => dirname(__DIR__),
    'bootstrap' => ['log', 'v1'],
    'modules'    => [
        'v1' => [
            'class' => 'rest\versions\v1\RestModule'
        ],
        'v2' => [
            'class' => 'rest\versions\v2\RestModule'
        ],
    ],
    'components' => [
        'user'       => [
            'identityClass' => 'common\models\User',
            'enableSession' => false,
        ],
        'response'   => [
            'format'  => yii\web\Response::FORMAT_JSON,
            'charset' => 'UTF-8',
        ],
        'log'        => [
            'targets' => [
                [
                    'class'   => 'yii\log\FileTarget',
                    'levels'  => ['error', 'warning'],
                    'logVars' => [],

                    // Exclude the "very common" unauthorized API call exception
                    'except'  => ['yii\web\HttpException:40*'],
                ],
            ],
        ],
        'request'    => [
            'class'                  => '\yii\web\Request',
            'enableCookieValidation' => false,
            'parsers'                => [
                'application/json' => 'yii\web\JsonParser',
            ],
        ],
        'urlManager' => [
            'enablePrettyUrl' => true,
            'enableStrictParsing' => true,
            'showScriptName' => false,
        ],
    ],
    'params'     => $params,
];
