<?php
error_reporting(E_ALL);
require(__DIR__ . '/../../vendor/autoload.php');
require(__DIR__ . '/../../vendor/yiisoft/yii2/Yii.php');
require(__DIR__ . '/../../common/config/bootstrap.php');

$config = yii\helpers\ArrayHelper::merge(
    requireIfExists(__DIR__ . '/../../common/config/main.php'),
    requireIfExists(__DIR__ . '/../../common/config/main-local.php'),
    requireIfExists(__DIR__ . '/../../rest/config/main.php'),
    requireIfExists(__DIR__ . '/../../rest/config/main-local.php')
);

(new yii\web\Application($config));
