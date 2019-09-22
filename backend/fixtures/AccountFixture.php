<?php

namespace fixtures;


use common\models\Account;
use common\models\User;
use Faker\Factory;
use yii\base\Exception;
use yii\test\ActiveFixture;



class AccountFixture extends ActiveFixture
{
    public $modelClass = Account::class;
    public $depends = [
        UserFixture::class,
    ];

    public function __construct($config = [])
    {
        parent::__construct($config);
    }

    protected function getData()
    {
        $faker = Factory::create();

        $data = [];

        // Attach the accounts to various users
        $allUserIds = User::find()
                          ->select('id')
                          ->column();

        if (empty($allUserIds)) {
            throw new Exception('Can not create fixtures for account because there are no users in the DB');
        }

        foreach ($allUserIds as $idUser) {
            for ($index = 0; $index < 15; $index++) {
                $start = '-3 months';
                $end = 'now';
                $timestamp = $faker->dateTimeBetween($start, $end)
                                   ->getTimestamp();
                $data[] = [
                    'name' => ucwords($faker->words(3, true)),
                    'starting_balance' => $faker->randomFloat(2, 0, 1500),
                    'created_at' => $timestamp,
                    'updated_at' => $timestamp,
                    'owner_id' => $idUser,
                ];
            }
        }

        return $data;
    }
}
