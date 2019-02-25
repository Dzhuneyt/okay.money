<?php

namespace console\controllers;


class FixtureController extends \yii\faker\FixtureController
{

    public function init()
    {
        parent::init();
        $this->namespace = 'tests\fixtures';
        $this->templatePath = 'tests/fixtures/templates';
        $this->fixtureDataPath = '@tests/fixtures/data';
    }

}
