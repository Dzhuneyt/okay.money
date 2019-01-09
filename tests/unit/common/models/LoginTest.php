<?php
/**
 * Created by PhpStorm.
 * User: ubuntu
 * Date: 1/9/19
 * Time: 1:48 PM
 */

namespace tests\unit\common\models;


use common\models\Login;
use common\models\User;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class LoginTest extends TestCase
{
    private function getMock()
    {
        /**
         * @var $mock Login|MockObject
         */
        $mock = $this->getMockBuilder(Login::class)
            ->disableOriginalConstructor()
            ->setMethodsExcept(['login'])
            ->getMock();
        return $mock;
    }

    public function testLoginMethodFalse()
    {
        $mock = $this->getMockBuilder(Login::class)
            ->disableOriginalConstructor()
            ->setMethodsExcept(['login'])
            ->getMock();
        $mock->method('validate')
            ->willReturn(false);

        $resultValidationError = $mock->login();
        $this->assertFalse($resultValidationError);
    }

    public function testLoginMethodTrue()
    {
        $mock = $this->getMockBuilder(Login::class)
            ->disableOriginalConstructor()
            ->setMethodsExcept(['login'])
            ->getMock();
        $mock->method('validate')
            ->willReturn(true);

        $userMock = $this->getMockBuilder(User::class)
            ->setMethods(['login'])
            ->getMock();
        \Yii::$app->set('user', $userMock);

        $userMock->expects($this->once())
            ->method('login')
            ->willReturn(true);

        $result = $mock->login();
        $this->assertTrue($result);
    }

    public function testLoginMethodTrueButUserComponentDoesntLogin()
    {
        $mock = $this->getMockBuilder(Login::class)
            ->disableOriginalConstructor()
            ->setMethodsExcept(['login'])
            ->getMock();
        $mock->method('validate')
            ->willReturn(true);

        $userMock = $this->getMockBuilder(User::class)
            ->setMethods(['login'])
            ->getMock();
        \Yii::$app->set('user', $userMock);

        $userMock->expects($this->once())
            ->method('login')
            ->willReturn(false);

        $result = $mock->login();
        $this->assertFalse($result);
    }
}
