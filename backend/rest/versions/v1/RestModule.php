<?php

namespace rest\versions\v1;

use yii\base\Application;
use yii\base\BootstrapInterface;
use yii\base\Module;

class RestModule extends Module implements BootstrapInterface
{

    /**
     * Bootstrap method to be called during application bootstrap stage.
     * @param Application $app the application currently running
     */
    public function bootstrap($app)
    {
        $moduleId = $this->id;

        $app->getUrlManager()->addRules([
            [
                'class' => 'yii\rest\UrlRule',
                'controller' => [
                    $moduleId . '/account',
                    $moduleId . '/transaction',
                    $moduleId . '/category',
                    $moduleId . '/stats',
                ],
                'extraPatterns' => [
                    'GET by_category' => 'by_category',
                    'OPTIONS <action:\w+>' => 'options',
                ],
            ],
            [
                'class' => 'yii\rest\UrlRule',
                'pluralize' => false,
                'controller' => [
                    $moduleId . '/user',
                ],
                'extraPatterns' => [
                    'POST login' => 'login',
                ],
            ],
        ]);

//        var_dump($app->getUrlManager()->rules);
//        exit;
    }
}
