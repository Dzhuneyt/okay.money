<?php
/**
 * @var $faker \Faker\Generator
 * @var $index integer
 */
$timestamp = $faker->dateTime()->getTimestamp();

//$randomUserId = $faker->randomElement(\common\models\Account::find()->select('id')->column());

return [
    'name' => $faker->words(3, true),
    'starting_balance' => $faker->randomFloat(2, 0, 99),

    // Will be overridden later (in AccountFixture.php)
    'owner_id' => $index + 1,
    'created_at' => $timestamp,
    'updated_at' => $timestamp,
];
