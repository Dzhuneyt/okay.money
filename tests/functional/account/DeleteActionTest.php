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
        $account = $this->createAccount();
        $success = $this->apiCall('v1/accounts/'.$account['id'], 'DELETE');
        $this->assertEquals($account['id'], $success['id']);
    }

    public function testDeleteAnotherUserAccount()
    {
        $this->markTestIncomplete();
    }

    protected function tearDown()
    {
        if (!$this->deleteUser($this->baseUser->id)) {
            throw new ServerErrorHttpException('Can not delete temp user for tests: ' . $this->baseUser->id);
        }
        parent::tearDown();
    }

}