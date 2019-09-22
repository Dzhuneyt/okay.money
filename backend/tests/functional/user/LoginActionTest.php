<?php

namespace tests\functional\user;


use tests\functional\FunctionalTestCase;

class LoginActionTest extends FunctionalTestCase
{

    const USERNAME = 'testuser1';
    const PASSWORD = 'testUser123password%!@';

    public function testPreFlight()
    {
        $this->assertPreflightrequest('v1/user/login');
    }

    public function testUserLogin()
    {
        $user = $this->createUser(self::USERNAME, self::PASSWORD);

        $result = $this->apiCall('v1/user/login',
            'POST',
            [
                'username' => self::USERNAME,
                'password' => self::PASSWORD,
            ]);
        $this->assertNotNull($result['auth_key'], 'Login API did not return auth key');

        $this->deleteUser($user->id);
    }

    protected function setUp()
    {
        parent::setUp();
    }

}
