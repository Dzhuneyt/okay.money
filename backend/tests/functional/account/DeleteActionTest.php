<?php
/**
 * Created by PhpStorm.
 * User: ubuntu
 * Date: 12/10/18
 * Time: 5:46 PM
 */

namespace tests\functional\account;

use tests\functional\FunctionalTestCase;
use yii\web\ForbiddenHttpException;

class DeleteActionTest extends FunctionalTestCase
{

    protected function setUp()
    {
        parent::setUp();

        $this->loginAsUser($this->baseUser->id);
    }

    public function testDeleteMyOwnAccount()
    {
        $account = $this->apiCall(
            'v1/accounts',
            'POST',
            [
                'name' => '[TEST] My wallet',
            ]
        );
        $success = $this->apiCall('v1/accounts/' . $account['id'], 'DELETE');
        $this->assertNull($success, 'Can not delete my own account');
    }

    public function testDeleteAnotherUserAccount()
    {
        $account = $this->apiCall(
            'v1/accounts',
            'POST',
            [
                'name' => '[TEST] My wallet',
            ]
        );
        $user2 = $this->createUser();
        $this->loginAsUser($user2->id);
        $this->expectException(ForbiddenHttpException::class);
        try {
            $this->apiCall('v1/accounts/' . $account['id'], 'DELETE');
        } finally {
            $this->deleteAccount($account['id']);
            $this->deleteUser($user2->id);
        }
    }

}