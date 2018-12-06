<?php
error_reporting(E_ALL);
define('YII_DEBUG', true);
require(__DIR__ . '/../../vendor/autoload.php');
require(__DIR__ . '/../../vendor/yiisoft/yii2/Yii.php');
require(__DIR__ . '/../../common/config/bootstrap.php');

$config = yii\helpers\ArrayHelper::merge(
    require(__DIR__ . '/../../common/config/main.php'),
    require(__DIR__ . '/../../common/config/main-local.php'),
    require(__DIR__ . '/../../rest/config/main.php'),
    require(__DIR__ . '/../../rest/config/main-local.php'),
    require(__DIR__ . '/../../common/config/tests.php'),
    require(__DIR__ . '/../../common/config/tests-local.php')
);

(new yii\web\Application($config));