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
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('email_verified_at');
            $table->dropColumn('name');
    
            $table->string('ime')->after('id');
            $table->string('prezime')->after('ime');
            $table->string('broj_indeksa')->nullable()->after('prezime');
            $table->unsignedTinyInteger('godina_studija')->nullable()->after('broj_indeksa');
            $table->string('smer')->nullable()->after('godina_studija');
            $table->enum('role', ['student', 'sluzbenik'])->after('smer');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('email_verified_at')->nullable();

            $table->dropColumn('broj_indeksa');
            $table->dropColumn('godina_studija');
            $table->dropColumn('smer');
            $table->dropColumn('role');
        });
    }
};
