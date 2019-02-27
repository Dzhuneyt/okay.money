<?php
/**
 * @var $faker \Faker\Generator
 * @var $index integer
 */
$timestamp = $faker->dateTime()->getTimestamp();
$username = 'demo' . ($index + 1);
$passwordHash = Yii::$app->getSecurity()->generatePasswordHash($username, 4);

return [
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
