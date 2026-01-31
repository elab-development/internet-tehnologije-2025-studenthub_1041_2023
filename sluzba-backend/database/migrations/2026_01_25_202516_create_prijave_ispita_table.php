<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('prijave_ispita', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id'); // user_id
            $table->unsignedBigInteger('predmet_id');
            $table->tinyInteger('rok')->comment('Broj ispitnog roka, npr. 1-6');
            $table->tinyInteger('broj_prijave')->comment('Koliko puta je prijavio ispit');
            $table->enum('status', ['prijavljen', 'polozen', 'nepolozen'])->default('prijavljen');
            $table->unsignedTinyInteger('ocena')->nullable(); // ocena ako je položio
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prijave_ispita');
    }
};
