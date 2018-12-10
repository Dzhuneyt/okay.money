<?php
/**
 * Created by PhpStorm.
 * User: ubuntu
 * Date: 12/10/18
 * Time: 5:30 PM
 */

namespace tests\functional\account;


use common\models\User;
use tests\functional\FunctionalTestCase;
use yii\web\ServerErrorHttpException;

class UpdateActionTest extends FunctionalTestCase
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


    public function testCanUpdateTheNameOfMyAccounts()
    {
        $newAccountName = '[TEST] new account name';

        $newAccount = $this->apiCall(
            'v1/accounts',
            'POST',
            [
                'name' => '[TEST] My account',
            ]
        );
        $result = $this->apiCall('v1/accounts/' . $newAccount['id'], 'PUT', [
            'name' => $newAccountName
        ]);
        $this->assertEquals($newAccountName, $result['name']);
    }

    protected function tearDown()
    {
        if (!$this->deleteUser($this->baseUser->id)) {
            throw new ServerErrorHttpException('Can not delete temp user for tests: ' . $this->baseUser->id);
        }
        parent::tearDown();
    }
}