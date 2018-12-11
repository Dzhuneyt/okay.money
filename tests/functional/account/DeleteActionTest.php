<?php
/**
 * Created by PhpStorm.
 * User: ubuntu
 * Date: 12/10/18
 * Time: 5:46 PM
 */

namespace tests\functional\account;


use common\models\User;
use tests\functional\FunctionalTestCase;
use yii\web\ForbiddenHttpException;
use yii\web\ServerErrorHttpException;

class DeleteActionTest extends FunctionalTestCase
{
    /**
     * @var User
     */
    private $baseUser;

    protected function setUp()
    {
        parent::setUp();

        // Prerequisites for almost all tests
        $this->baseUser = $this->createUser();
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
        $user2   = $this->createUser();
        $this->loginAsUser($user2->id);
        $this->expectException(ForbiddenHttpException::class);
        try {
            $this->apiCall('v1/accounts/' . $account['id'], 'DELETE');
        } finally {
            $this->deleteAccount($account['id']);
            $this->deleteUser($user2->id);
        }
    }

    protected function tearDown()
    {
        if ( ! $this->deleteUser($this->baseUser->id)) {
            throw new ServerErrorHttpException('Can not delete temp user for tests: ' . $this->baseUser->id);
        }
        parent::tearDown();
    }

}