<?php
/**
 * Created by PhpStorm.
 * User: ubuntu
 * Date: 1/9/19
 * Time: 1:43 PM
 */

namespace tests\unit\common\models;


use common\models\Category;
use PHPUnit\Framework\TestCase;
use yii\behaviors\TimestampBehavior;

class CategoryTest extends TestCase
{

    public function testTimestampBehaviorIsAttached()
    {
        /**
         * @var $mock Category
         */
        $mock = $this->getMockBuilder(Category::class)
            ->disableOriginalConstructor()
            ->setMethodsExcept(['behaviors'])
            ->getMock();

        $behaviors = $mock->behaviors();

        $timestampBehaviorFound = false;
        foreach ($behaviors as $behaviorClass) {
            if ($behaviorClass === TimestampBehavior::class) {
                $timestampBehaviorFound = true;
            }
        }

        $this->assertTrue($timestampBehaviorFound, 'TimestampBehavior is not attached to Category model');
    }
}
