<?php

namespace Database\Seeders;

use App\Models\Predmet;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PredmetUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $studenti = User::where('role', 'student')->get();

        //maksimalno moze imati do 70espb
        foreach ($studenti as $student) {
            $godinaStudenta = $student->godina_studija;
            $espbZbir = 0;
            $maksimalnoEspb = 70;

            // Prvo uzmi predmete iz njegove godine, prioritet
            $predmeti = Predmet::where('godina', '<=', $godinaStudenta)->inRandomOrder()->get();

            foreach ($predmeti as $predmet) {
                if ($espbZbir + $predmet->espb > $maksimalnoEspb) {
                    continue;
                }

                $student->predmeti()->attach($predmet->id, [
                    'status_predavanja' => fake()->randomElement(['aktivan', 'pauziran', null]),
                    'upisano_u_godini' => $godinaStudenta,
                ]);

                $espbZbir += $predmet->espb;

                if ($espbZbir >= $maksimalnoEspb) {
                    break;
                }
            }
        }
    }
}

