<?php

namespace fixtures;


use Faker\Factory;
use Faker\Generator;
use Yii;
use yii\test\ActiveFixture;



class UserFixture extends ActiveFixture
{
    private $faker;
    public $tableName = 'user';

    public function __construct($config = [], Generator $faker)
    {
        parent::__construct($config);
        $this->faker = $faker;
    }

    /**
     * @return array
     */
    public function getData(): array
    {
        $faker = Factory::create();
        $data = [];
        for ($index = 0; $index < 10; $index++) {
            // Create fake users
            $timestamp = $faker->dateTime('now')
                               ->getTimestamp();
            $username = 'demo' . ($index + 1);
            $passwordHash = Yii::$app->getSecurity()
                                     ->generatePasswordHash($username, 4);
            $data[] = [
                'id' => $index + 1,
                'username' => $username,
                'auth_key' => 'auth-token-' . $index,
                'password_hash' => $passwordHash,
                'password_reset_token' => $passwordHash,
                'email' => $username . '@example.com',
                'status' => 10,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ];
        }
        return $data;
    }
}
