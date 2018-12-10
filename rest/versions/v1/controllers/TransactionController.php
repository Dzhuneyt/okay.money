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

class TransactionController extends ActiveController
{
    public $modelClass = Transaction::class;

}