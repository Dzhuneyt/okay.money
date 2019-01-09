<?php

namespace tests\unit\helpers;


use PHPUnit\Framework\TestCase;
use yii\web\ServerErrorHttpException;

/**
 * A reusable base class that can be used to test repeating CreateAction.php files
 * Just extend this class and override the class properties
 *
 * Class BaseCreateActionUnitTest
 * @package tests\unit\helpers
 */
abstract class BaseCreateActionUnitTest extends TestCase
{
    /**
     * Override in implementing class with the specific "CreateAction" instance
     * @var null
     */
    protected $actionClass = null;

    /**
     * Override in implementing classes
     * @var null
     */
    protected $modelClass = null;

    /**
     * @throws \yii\base\InvalidConfigException
     * @throws \yii\web\ServerErrorHttpException
     */
    public function testRunMethodWillCallHandleSuccessMethod()
    {
        $actionMock = $this->_getCreateActionMock();
        $actionMock->method('createModel')
            ->willReturn($this->_getModelMock($this->modelClass, true));

        $actionMock->expects($this->once())
            ->method('handleSuccess');

        $actionMock->run();
    }

    public function testRunMethodWillCallErrorHandler()
    {
        $mock = $this->_getCreateActionMock();

        $mock->method('createModel')
            ->willReturn($this->_getModelMock($this->modelClass, false));

        $mock->expects($this->once())
            ->method('handleError');

        $this->expectException(ServerErrorHttpException::class);

        $mock->run();
    }

    /**
     * @return \PHPUnit\Framework\MockObject\MockObject|\yii\rest\CreateAction
     */
    protected function _getCreateActionMock()
    {
        $mock = $this->getMockBuilder($this->actionClass)
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
     * @param $class
     * @param bool $saveable Whether or not calling $model->save() will return true or false
     *
     * @return \PHPUnit\Framework\MockObject\MockObject
     */
    protected function _getModelMock($class, $saveable = true)
    {
        $mock = $this->getMockBuilder($class)
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
