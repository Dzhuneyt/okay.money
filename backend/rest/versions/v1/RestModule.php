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

        $app->getUrlManager()
            ->addRules([
                [
                    'class' => 'yii\rest\UrlRule',
                    'controller' => [
                        $moduleId . '/account',
                        $moduleId . '/transaction',
                        $moduleId . '/category',
                        $moduleId . '/stats',
                        $moduleId . '/user',
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
                        'PUT profile' => 'profile',
                        'GET profile' => 'profile_get',
                        'OPTIONS <action:\w+>' => 'options',
                    ],
                ],
            ]);

//        var_dump($app->getUrlManager()->rules);
//        exit;
    }
}
