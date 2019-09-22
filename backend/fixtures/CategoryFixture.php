<?php

namespace fixtures;


use common\models\Category;
use common\models\User;
use Faker\Factory;
use yii\base\Exception;
use yii\test\ActiveFixture;



class CategoryFixture extends ActiveFixture
{
    public $modelClass = Category::class;
    public $depends = [
        UserFixture::class,
    ];

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
            for ($index = 0; $index < 10; $index++) {
                $start = '-3 months';
                $end = 'now';
                $timestamp = $faker->dateTimeBetween($start, $end)
                                   ->getTimestamp();
                $data[] = [
                    'name' => ucwords($faker->words(3, true)),
                    'description' => $faker->text(255),
                    'created_at' => $timestamp,
                    'updated_at' => $timestamp,
                    'owner_id' => $idUser,
                ];
            }
        }

        return $data;
    }
}
