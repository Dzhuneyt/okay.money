<?php

namespace fixtures;


use common\models\Account;
use common\models\Category;
use common\models\Transaction;
use common\models\User;
use Faker\Factory;
use yii\test\ActiveFixture;



class TransactionFixture extends ActiveFixture
{
    public $modelClass = Transaction::class;
    public $depends = [
        UserFixture::class,
        AccountFixture::class,
        CategoryFixture::class,
    ];

    protected function getData()
    {
        $data = [];

        $faker = Factory::create();

        $userIds = User::find()
                       ->select('id')
                       ->column();

        foreach ($userIds as $idUser) {
            $userCategories = Category::find()
                                      ->select('id')
                                      ->where(['owner_id' => $idUser])
                                      ->column();
            $userAccounts = Account::find()
                                   ->select('id')
                                   ->where(['owner_id' => $idUser])
                                   ->column();

            for ($index = 0; $index < 500; $index++) {
                $randomCategory = $userCategories[array_rand($userCategories)];
                $randomAccount = $userAccounts[array_rand($userAccounts)];

                $timestamp = $faker->dateTime()
                                   ->getTimestamp();

                $data[] = [
                    'description' => $faker->realText(255),
                    'sum' => $faker->randomFloat(2, -2500, 2500),

                    'created_at' => $timestamp,
                    'updated_at' => $timestamp,

                    'account_id' => $randomAccount,
                    'category_id' => $randomCategory,
                ];
            }
        }

        return $data;
    }
}
