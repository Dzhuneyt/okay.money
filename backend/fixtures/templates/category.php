<?php
/**
 * @var $faker \Faker\Generator
 * @var $index integer
 */
$timestamp = $faker->dateTime()->getTimestamp();

return [
    'name' => $faker->words(3, true),
    'description' => $faker->text(255),
    'created_at' => $timestamp,
    'updated_at' => $timestamp,
];
