<?php

namespace Database\Seeders;

use App\Models\Predmet;
use App\Models\Profesor;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PredmetSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $profesori = Profesor::all();

        $naziviPoGodini = [
            1 => ['Principi programiranja', 'Matematika 1', 'Engleski jezik 1', 'OIKT', 'Ekonomija', 'Programiranje 1',],
            2 => ['Upravljanje ljudskim resursima', 'Teorija Verovatnoce', 'Menadžment', 'Programiranje 2', 'Matematika 2', 'Engleski jezik 2','Statistika','Elektronsko Poslovanje','SPA'],
            3 => ['Operaciona istrazivanja 1', 'Teorija sistema', 'Web programiranje', 'Projektni menadžment', 'Bezbednost sistema', 'Analiza sistema', 'Programski Jezici'],
            4 => ['Veštačka inteligencija', 'Mobilne aplikacije', 'Završni rad', 'Internet Tehnologije', 'Projektovanje softvera', 'Internet Marketing','Strucna Praksa']
        ];

        foreach ($naziviPoGodini as $godina => $nazivi) {
            foreach ($nazivi as $naziv) {
                Predmet::factory()->create([
                    'naziv' => $naziv,
                    'godina' => $godina,
                    'profesor_id' => $profesori->random()->id,
                    // ostala polja (espb, semestar, obavezan) se povlače iz factory-ja
                ]);
            }
        }
    }
}
