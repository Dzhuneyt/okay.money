<?php

namespace console\controllers;


class FixtureController extends \yii\faker\FixtureController
{

    public function init()
    {
        parent::init();
        $this->namespace = 'fixtures';
        $this->templatePath = 'fixtures/templates';
        $this->fixtureDataPath = '@fixtures/data';
    }

}
