<?php
/**
 * Created by PhpStorm.
 * User: Dzhuneyt
 * Date: 10.12.2018 г.
 * Time: 21:59
 */

namespace rest\versions\v1\controllers;


use common\models\Transaction;
use rest\versions\shared\controllers\ActiveController;
use rest\versions\v1\actions\transaction\CreateAction;
use rest\versions\v1\actions\transaction\DeleteAction;
use rest\versions\v1\actions\transaction\IndexAction;
use rest\versions\v1\actions\transaction\UpdateAction;
use rest\versions\v1\actions\transaction\ViewAction;

class TransactionController extends ActiveController
{
    public $modelClass = Transaction::class;

    public function actions()
    {
        $actions                    = parent::actions();
        $actions['create']['class'] = CreateAction::class;
        $actions['view']['class']   = ViewAction::class;
        $actions['update']['class'] = UpdateAction::class;
        $actions['delete']['class'] = DeleteAction::class;
        $actions['index']['class']  = IndexAction::class;

        return $actions;
    }
}