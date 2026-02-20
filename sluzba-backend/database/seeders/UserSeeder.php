<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Profesor;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Službenik.
        User::create([
            'ime' => 'Isidora',
            'prezime' => 'Mandić',
            'email' => 'isidora.m@fon.bg.ac.rs',
            'password' => Hash::make('admin'),
            'broj_indeksa' => null,
            'smer' => null,
            'godina_studija' => null,
            'role' => 'sluzbenik'
        ]);

        // Profesor (user).
        $profUser = User::create([
            'ime' => 'Selena',
            'prezime' => 'Kačarević',
            'email' => 'selena.kacarevic@fon.bg.ac.rs',
            'password' => Hash::make('profesor'),
            'broj_indeksa' => null,
            'smer' => null,
            'godina_studija' => null,
            'role' => 'profesor'
        ]);

        // ✅ Poveži tog user-a sa tabelom profesori (user_id).
        // Ako Profesor tabela ima kolone: ime, prezime, zvanje (kao u factory), popuni ih.
        Profesor::updateOrCreate(
            ['user_id' => $profUser->id],
            [
                'ime' => $profUser->ime,
                'prezime' => $profUser->prezime,
                'zvanje' => 'Docent',
            ]
        );

        // Student (test user).
        User::create([
            'ime' => 'Stefan',
            'prezime' => 'Peković',
            'email' => 'stefan.peković@student.fon.bg.ac.rs',
            'password' => Hash::make('stefan.peković1039'),
            'broj_indeksa' => '1039/2023',
            'smer' => 'Informacione Tehnologije i Sistemi',
            'godina_studija' => 4,
            'role' => 'student'
        ]);

        // Ostali studenti kroz factory.
        User::factory(10)->create();
    }
}