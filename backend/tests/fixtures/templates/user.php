<?php
/**
 * @var $faker \Faker\Generator
 * @var $index integer
 */
$timestamp = $faker->dateTime()->getTimestamp();

return [
    'id' => $index + 1,
    'username' => $faker->userName,
    'auth_key' => Yii::$app->getSecurity()->generateRandomString(),
    'password_hash' => Yii::$app->getSecurity()->generatePasswordHash('password_' . $index),
    'password_reset_token' => Yii::$app->getSecurity()->generatePasswordHash('password_' . $index),
    'email' => $faker->email,
    'status' => 10,
    'created_at' => $timestamp,
    'updated_at' => $timestamp,
];
