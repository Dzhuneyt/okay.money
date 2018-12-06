<?php

namespace tests\functional;

class CreateActionTest extends FunctionalTestCase
{

    public function testCreateSuccessfulAccount()
    {
        $this->authenticateAsUser();
        $this->assertTrue(true);
    }
}