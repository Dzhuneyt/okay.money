<?php
/**
 * @var $faker \Faker\Generator
 * @var $index integer
 */
$start = '-3 years';
$end = 'now';
$timestamp = $faker->dateTimeBetween($start, $end)->getTimestamp();

//$randomUserId = $faker->randomElement(\common\models\Account::find()->select('id')->column());

return [
    'name' => $faker->words(3, true),
    'starting_balance' => $faker->randomFloat(2, 0, 1500),
    'created_at' => $timestamp,
    'updated_at' => $timestamp,
];
