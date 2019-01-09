<?php

namespace tests\unit\rest\versions\v1\actions\account;


use common\models\Category;
use rest\versions\v1\actions\account\CreateAction;
use tests\unit\helpers\BaseCreateActionUnitTest;

class CreateActionTest extends BaseCreateActionUnitTest
{
    protected $actionClass = CreateAction::class;
    protected $modelClass = Category::class;
}
