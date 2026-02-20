<?php

namespace Database\Seeders;

use App\Models\Profesor;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProfesorSeeder extends Seeder
{
    public function run(): void
    {
        // Sigurnosno: ako postoji user sa role=profesor, osiguraj da ima profesora.
        $profUser = User::where('role', 'profesor')->first();

        if ($profUser) {
            Profesor::updateOrCreate(
                ['user_id' => $profUser->id],
                [
                    'ime' => $profUser->ime,
                    'prezime' => $profUser->prezime,
                    'zvanje' => 'Docent',
                ]
            );
        }

        // Pošto je 1 profesor već kreiran (Selena), napravi još 14.
        Profesor::factory(14)->create();
    }
}