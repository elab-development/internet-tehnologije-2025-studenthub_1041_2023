<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PrijavaIspita>
 */
class PrijavaIspitaFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => \App\Models\User::factory(),
            'predmet_id' => \App\Models\Predmet::factory(),
            'rok' => $this->faker->numberBetween(1, 6),
            'broj_prijave' => $this->faker->numberBetween(1, 5),
            'ocena' => $this->faker->optional()->numberBetween(5, 10),
            'status' => $this->faker->randomElement(['prijavljen', 'nepolozen', 'polozen'],)
        ];
    }
}
