<?php

namespace tests\functional;

class CreateActionTest extends FunctionalTestCase
{

    public function testCreateSuccessfulAccount()
    {
        $this->loginAsUser();
        $result = $this->apiCall('v1/accounts', 'POST', [
            'name' => 'My wallet',
        ]);
        $this->assertNotNull($result['id'], 'Failed to create a wallet as a regular user');
    }

    public function testFailToCreateWalletAnonymously()
    {
        $this->expectExceptionCode(403);
        $this->loginAsAnonymous();
        $result = $this->apiCall('v1/accounts', 'POST', [
            'name' => 'My wallet',
        ]);
    }


}