<?php

namespace tests\unit\console\controllers;


use console\controllers\ServerController;
use PHPUnit\Framework\TestCase;

class ServerControllerTest extends TestCase
{

    public function testOptionsMethodReturnsTestOption()
    {
        $mock = $this->getMock();
        $options = $mock->options('index');
        $this->assertContains('test', $options);
    }

    private function getMock()
    {
        $mock = $this->getMockBuilder(ServerController::class)
            ->disableOriginalConstructor()
            ->setMethods(null)
            ->getMock();
        return $mock;
    }
}
