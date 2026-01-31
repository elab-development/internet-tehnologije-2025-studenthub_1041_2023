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
        Schema::table('predmeti', function (Blueprint $table) {
            $table->foreign('profesor_id')->references('id')->on('profesori')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('predmeti', function (Blueprint $table) {
            $table->dropForeign(['profesor_id']);
        });
    }
};
