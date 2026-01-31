<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
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

        User::factory(10)->create();

    }
}
