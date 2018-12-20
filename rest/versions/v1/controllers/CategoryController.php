<?php

namespace rest\versions\v1\controllers;


use common\models\Category;
use rest\versions\shared\controllers\ActiveController;

class CategoryController extends ActiveController
{
    public $modelClass = Category::class;
}