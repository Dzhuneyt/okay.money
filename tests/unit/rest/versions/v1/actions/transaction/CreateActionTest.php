<?php

namespace tests\unit\rest\versions\v1\actions\transaction;


use common\models\Transaction;
use rest\versions\v1\actions\transaction\CreateAction;
use tests\unit\helpers\BaseCreateActionUnitTest;
use yii\web\BadRequestHttpException;

class CreateActionTest extends BaseCreateActionUnitTest
{
    protected $actionClass = CreateAction::class;
    protected $modelClass = Transaction::class;

    public function testValidatesParamAccountId()
    {
        /**
         * @var $mock CreateAction
         */
        $mock = $this->getMockBuilder($this->actionClass)
            ->disableOriginalConstructor()
            ->setMethods(['run'])
            ->getMock();

        $this->expectException(BadRequestHttpException::class);
        $this->expectExceptionMessageRegExp('(account_id)');
        $mock->validateParams([]);
    }

    public function testValidatesParamSum()
    {
        /**
         * @var $mock CreateAction
         */
        $mock = $this->getMockBuilder($this->actionClass)
            ->disableOriginalConstructor()
            ->setMethods(['run'])
            ->getMock();

        $this->expectException(BadRequestHttpException::class);
        $this->expectExceptionMessageRegExp('(sum)');
        $mock->validateParams([
            'account_id' => 1,
            'sum' => -5
        ]);
    }

    protected function _getModelMock($class, $saveable = true)
    {
        $model = parent::_getModelMock($class, $saveable);
        return $model;
    }

    protected function _getCreateActionMock()
    {
        $action = parent::_getCreateActionMock();
        $action->checkAccess = function () {
            return true;
        };

        return $action;
    }
}
