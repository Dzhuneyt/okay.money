<?php
Yii::setAlias('common', dirname(__DIR__));
Yii::setAlias('backend', dirname(dirname(__DIR__)) . '/backend');
Yii::setAlias('rest', dirname(dirname(__DIR__)) . '/rest');
Yii::setAlias('console', dirname(dirname(__DIR__)) . '/console');
Yii::setAlias('tests', dirname(dirname(__DIR__)) . '/tests');
Yii::setAlias('fixtures', dirname(dirname(__DIR__)) . '/fixtures');

function requireIfExists($file)
{
    if (!is_file($file)) {
        return [];
    }
    return require($file);
}
