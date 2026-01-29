<?php

namespace Database\Seeders;

use App\Models\PrijavaIspita;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PrijavaIspitaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $studenti = User::where('role', 'student')->get();
        
        foreach ($studenti as $student) {
            // Uzmi predmete koje sluša student
            $predmeti = $student->predmeti;

            // Izaberi nasumično 40–70% predmeta koje je odlučio da prijavi
            $prijavljeniPredmeti = $predmeti->random(rand(
                intval($predmeti->count() * 0.4),
                max(1, intval($predmeti->count() * 0.7))
            ));

            foreach ($prijavljeniPredmeti as $predmet) {
                // Student je možda više puta prijavljivao isti predmet
                $brojPrijava = fake()->numberBetween(1, 3);

                for ($i = 1; $i <= $brojPrijava; $i++) {
                    $status = fake()->randomElement(['prijavljen', 'nepolozen', 'polozen']);

                    $ocena = match ($status) {
                        'nepolozen' => 5,
                        'polozen'   => fake()->numberBetween(6, 10),
                        default     => null,
                    };

                    PrijavaIspita::create([
                        'user_id' => $student->id,
                        'predmet_id' => $predmet->id,
                        'rok' => fake()->numberBetween(1, 6),
                        'broj_prijave' => $i,
                        'status' => $status,
                        'ocena' => $ocena,
                    ]);
                }
            }
        }
        
    }
}
