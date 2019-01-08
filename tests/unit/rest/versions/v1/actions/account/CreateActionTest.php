<?php
/**
 * Date: 16.12.2018 г.
 * Time: 21:03
 */

namespace tests\unit\rest\versions\v1\actions\account;


use common\models\Account;
use PHPUnit\Framework\TestCase;
use rest\versions\v1\actions\account\CreateAction;
use yii\web\ServerErrorHttpException;

class CreateActionTest extends TestCase
{

    /**
     * @throws \yii\base\InvalidConfigException
     * @throws \yii\web\ServerErrorHttpException
     */
    public function testRunMethodWillCallHandleSuccessMethod()
    {
        $actionMock = $this->_getCreateActionMock();
        $actionMock->method('createModel')
                   ->willReturn($this->_getAccountModelMock(true));

        $actionMock->expects($this->once())
                   ->method('handleSuccess');

        $actionMock->run();
    }

    public function testRunMethodWillCallErrorHandler()
    {
        $mock = $this->_getCreateActionMock();

        $mock->method('createModel')
             ->willReturn($this->_getAccountModelMock(false));

        $mock->expects($this->once())
             ->method('handleError');

        $this->expectException(ServerErrorHttpException::class);

        $mock->run();
    }

    /**
     * @return \PHPUnit\Framework\MockObject\MockObject|CreateAction
     */
    private function _getCreateActionMock()
    {
        $mock = $this->getMockBuilder(CreateAction::class)
                     ->disableOriginalConstructor()
                     ->setMethodsExcept(['run'])
                     ->getMock();

        $mock->method('handleSuccess')
             ->willReturn(true);
        $mock->method('handleError')
             ->willThrowException(new ServerErrorHttpException());

        return $mock;
    }

    /**
     * @param bool $saveable Whether or not calling $model->save() will return true or false
     *
     * @return Account
     */
    private function _getAccountModelMock($saveable = true)
    {
        $mock = $this->getMockBuilder(Account::class)
                     ->disableOriginalConstructor()
                     ->getMock();
        $mock->method('primaryKey')
             ->willReturn('id');
        $mock->method('getPrimaryKey')
             ->willReturn([1]);
        $mock->method('save')
             ->willReturn($saveable);

        return $mock;
    }
}