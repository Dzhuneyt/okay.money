<?php
/**
 * Created by PhpStorm.
 * User: dzhuneyt
 * Date: 24.02.19
 * Time: 18:28
 */

namespace tests\fixtures;


use common\models\Account;
use common\models\User;
use yii\test\ActiveFixture;

class AccountFixture extends ActiveFixture
{
    public $modelClass = Account::class;
    public $depends = [
        UserFixture::class,
    ];

    protected function getData()
    {
        $data = parent::getData();

        // Attach the accounts to various users
        $allUserIds = User::find()->select('id')->column();
        foreach ($data as $index => $item) {
            $data[$index]['owner_id'] = $allUserIds[array_rand($allUserIds)];
        }

        return $data;
    }
}
