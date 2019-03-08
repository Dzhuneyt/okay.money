<?php

namespace rest\versions\shared\helpers;


use yii\data\SqlDataProvider;

class BaseSqlDataProvider extends SqlDataProvider
{
    public $rowFormatter;

    public function getPagination()
    {
        $pagination = parent::getPagination();


        if (isset($pagination->params['page']) && $pagination->params['page']) {
            $pagination->page = $pagination->params['page'];
        }

        if (isset($pagination->params['page_size']) && $pagination->params['page_size']) {
            $pagination->pageSize = $pagination->params['page_size'];
        }

        return $pagination;
    }

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