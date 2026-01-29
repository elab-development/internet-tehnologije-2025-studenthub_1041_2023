<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {

        $ime = $this->faker->firstName;
        $prezime = $this->faker->lastName;
        $godina_upisa = $this->faker->numberBetween(2017, 2024);
        $redni_broj = str_pad($this->faker->unique()->numberBetween(1, 1100), 4, '0', STR_PAD_LEFT);
    
        $email_prefix = strtolower(substr($ime, 0, 1) . substr($prezime, 0, 1)) . $godina_upisa . $redni_broj;
        $email = $email_prefix . '@student.fon.bg.ac.rs';
         
        return [
            'ime' => $ime,
            'prezime' => $prezime,
            'email' => $email,
            'password' => bcrypt('lozinka'),
            'broj_indeksa' => $godina_upisa . '/' . $redni_broj,
            'smer' => $this->faker->randomElement(['Informacione Tehnologije i Sistemi', 
             'Menadzment', 'Operacioni Menadzment']),
            'godina_studija' => $this->faker->numberBetween(1, 4),
            'role' => 'student',
        ];
    }

}
