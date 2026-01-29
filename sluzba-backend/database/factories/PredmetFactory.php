<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Predmet>
 */
class PredmetFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'naziv' => $this->faker->unique()->word,
            'espb' => $this->faker->numberBetween(3, 10),
            'godina' => $this->faker->numberBetween(1, 4),
            'obavezan' => $this->faker->boolean(70),
            'semestar' => $this->faker->numberBetween(1, 2), //zimski i letnji
            'profesor_id' => \App\Models\Profesor::factory(),
        ];
    }
}
