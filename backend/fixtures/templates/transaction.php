<?php
/**
 * @var $faker \Faker\Generator
 * @var $index integer
 */
$timestamp = $faker->dateTime()->getTimestamp();

return [
    'description' => $faker->realText(255),
    'sum' => $faker->randomFloat(2, -2500, 2500),

    'created_at' => $timestamp,
    'updated_at' => $timestamp,

    // Fixture class will overwrite these
    'account_id' => null,
    'category_id' => null,
];
