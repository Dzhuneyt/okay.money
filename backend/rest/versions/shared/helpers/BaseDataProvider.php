<?php

namespace rest\versions\shared\helpers;


use yii\data\ActiveDataProvider;

class BaseDataProvider extends ActiveDataProvider
{
    public $rowFormatter;

    protected function prepareModels()
    {
        $originalModels = parent::prepareModels();
        if ($this->rowFormatter) {
            foreach ($originalModels as $i => $model) {
                $originalModels[$i] = call_user_func($this->rowFormatter, $model);
            }
        }

        return $originalModels;
    }
}