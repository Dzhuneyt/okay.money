<?php
error_reporting(E_ALL);
define('YII_DEBUG', true);
define('YII_ENV', 'dev');
require(__DIR__ . '/../../vendor/autoload.php');
require(__DIR__ . '/../../vendor/yiisoft/yii2/Yii.php');
require(__DIR__ . '/../../common/config/bootstrap.php');
require(__DIR__ . '/../../console/config/bootstrap.php');

$config = yii\helpers\ArrayHelper::merge(
    require(__DIR__ . '/../../common/config/main.php'),
    require(__DIR__ . '/../../common/config/main-local.php'),
    require(__DIR__ . '/../../rest/config/main.php'),
    require(__DIR__ . '/../../rest/config/main-local.php'),
    require(__DIR__ . '/../../common/config/tests.php'),
    require(__DIR__ . '/../../common/config/tests-local.php')
);

// Execute migrations every time before tests
try {
    $consoleApp = new yii\console\Application($config);
    $consoleApp->runAction('migrate/fresh', [
        'migrationPath' => '@console/migrations/',
        'interactive'   => '0',
        'compact'=>'1',
    ]);
} catch (Exception $e) {
    echo '--------------';
    echo 'Can not run functional tests due to a failure with migrations' . PHP_EOL;
    echo '--------------';
    throw $e;
}

(new yii\web\Application($config));