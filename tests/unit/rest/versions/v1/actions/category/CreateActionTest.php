<?php

namespace tests\unit\rest\versions\v1\actions\category;


use common\models\Category;
use rest\versions\v1\actions\category\CreateAction;
use tests\unit\helpers\BaseCreateActionUnitTest;

class CreateActionTest extends BaseCreateActionUnitTest
{
    protected $actionClass = CreateAction::class;
    protected $modelClass = Category::class;
}
