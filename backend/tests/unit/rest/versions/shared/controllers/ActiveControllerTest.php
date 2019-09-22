<?php

namespace tests\unit\rest\versions\shared\controllers;


use PHPUnit\Framework\TestCase;
use yii\filters\auth\QueryParamAuth;
use yii\rest\OptionsAction;
use yii\rest\Serializer;
use yii\web\NotFoundHttpException;

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

    public function testActionsReturnNotFoundByDefaultUnlessOverriden()
    {
        $mock = $this->getMock();

        foreach ($mock->actions() as $action) {
            if ($action['class'] === OptionsAction::class) {
                continue;
            }
            $this->assertArrayHasKey(
                'checkAccess',
                $action,
                'There is at least one action that does not define a checkAccess function. Action was: ' . print_r($action,
                    true)
            );
            try {
                call_user_func($action['checkAccess']);
            } catch (NotFoundHttpException $e) {
                // This is the expected behavior
            } catch (\Exception $e) {
                $this->fail('One of the default actions in ActiveController returned a response instead of error');
            }
        }
    }
}
