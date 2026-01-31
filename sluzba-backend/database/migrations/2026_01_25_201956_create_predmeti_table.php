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
        Schema::create('predmeti', function (Blueprint $table) {
            $table->id();
            $table->string('naziv');
            $table->unsignedTinyInteger('espb');
            $table->boolean('obavezan')->default(true);
            $table->unsignedTinyInteger('godina');
            $table->unsignedTinyInteger('semestar');
            $table->unsignedBigInteger('profesor_id');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('predmeti');
    }
};
