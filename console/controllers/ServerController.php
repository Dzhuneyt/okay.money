<?php

namespace console\controllers;


class ServerController extends \yii\console\controllers\ServeController
{
    public $docroot = '@rest/web';

    /**
     * @var bool Whether to run the lite server for unit tests (localhost:9009).
     * When "false", the development lite server will be launched (localhost:8080)
     */
    public $test = false;

    public function options($actionID)
    {
        $options   = parent::options($actionID);
        $options[] = 'test';

        return $options;
    }

    public function actionIndex($address = 'localhost')
    {
        if ($this->test) {
            if ($this->port === 8080) {
                // Only override the port if it was not passed as CLI argument
                // Maybe the guy that wants to run the testing lite server wants
                // to use a non-9009 port intentionally (however unlikely)
                $this->port = 9009;
            }
            $this->router = \Yii::getAlias('@rest/web/index-test.php');
        }

        return parent::actionIndex($address);
    }
}