<?php
/**
 * Date: 16.12.2018 г.
 * Time: 20:52
 */

namespace tests\unit\shared\controllers;


use PHPUnit\Framework\TestCase;
use yii\filters\auth\QueryParamAuth;
use yii\rest\Serializer;

class ActiveControllerTest extends TestCase
{

    /**
     * @return \rest\versions\shared\controllers\ActiveController
     */
    private function getMock()
    {
        /* @var $mock \rest\versions\shared\controllers\ActiveController */
        $mock = $this->getMockBuilder(\rest\versions\shared\controllers\ActiveController::class)
                     ->disableOriginalConstructor()
                     ->setMethods(null)
                     ->getMock();

        return $mock;
    }

    public function testAuthenticatorBehaviorIsAlwaysAttached()
    {

        $mock = $this->getMock();

        $behaviors = $mock->behaviors();

        $this->assertEquals(QueryParamAuth::class, $behaviors['authenticator']['class']);
    }

    public function testValidateSerializer()
    {
        $mock = $this->getMock();

        $this->assertEquals(Serializer::class, $mock->serializer['class']);
        $this->assertEquals('items', $mock->serializer['collectionEnvelope']);
    }
}