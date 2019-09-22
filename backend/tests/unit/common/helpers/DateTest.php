<?php
/**
 * Created by PhpStorm.
 * User: ubuntu
 * Date: 1/10/19
 * Time: 2:15 PM
 */

namespace tests\unit\common\helpers;


use common\helpers\Date;
use PHPUnit\Framework\TestCase;

class DateTest extends TestCase
{

    public function testWithRandomValidValues()
    {
        $values = [
            '2018-01-01 06:00:00',
            '2019-01-01 23:59:59'
        ];
        $mock = new Date();
        foreach ($values as $value) {
            $valid = $mock->isValidDate($value);
            $this->assertTrue($valid, 'Date format seen as invalid: ' . $value);
        }
    }

    public function testIsValidDateWithCustomFormat()
    {
        $mock = new Date();
        $valid = $mock->isValidDate('2019/01/01 23:59', 'Y/m/d H:i');
        $this->assertTrue($valid);
    }

    public function testIsValidDateWithInvalidDate()
    {
        $mock = new Date();
        $valid = $mock->isValidDate('22019-01-01 23:59:59');
        $this->assertFalse($valid);
    }
}
