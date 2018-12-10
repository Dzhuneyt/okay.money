<?php
/**
 * Created by PhpStorm.
 * User: ubuntu
 * Date: 12/10/18
 * Time: 5:28 PM
 */

namespace tests\functional\account;


use common\models\User;
use tests\functional\FunctionalTestCase;
use yii\web\ForbiddenHttpException;
use yii\web\ServerErrorHttpException;

class ViewActionTest extends FunctionalTestCase
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




    public function testGetMatadataOfOtherUserAccount()
    {
        // Create an account with USER 1
        $newAccount = $this->createAccount();
        // Now login as a different user
        $user2 = $this->createUser();
        $this->loginAsUser($user2->id);

        // Check if USER 2 is prevented access to the account of USER 1
        $this->expectException(ForbiddenHttpException::class);

        try {
            $this->apiCall('v1/accounts/' . $newAccount['id'], 'GET');
        } finally {
            // Cleanup
            $this->deleteUser($user2->id);
        }
    }

    public function testGetMetadataOfOwnAccount()
    {
        $newAccount = $this->apiCall(
            'v1/accounts',
            'POST',
            [
                'name' => '[TEST] My account',
            ]
        );
        $result = $this->apiCall('v1/accounts/' . $newAccount['id'], 'GET');
        $this->assertArrayHasKey('id', $result, 'Can not get metadata of your own account');
    }

    protected function tearDown()
    {
        if (!$this->deleteUser($this->baseUser->id)) {
            throw new ServerErrorHttpException('Can not delete temp user for tests: ' . $this->baseUser->id);
        }
        parent::tearDown();
    }

}