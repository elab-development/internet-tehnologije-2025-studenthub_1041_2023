<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // MySQL/MariaDB: izmeni enum da uključi 'profesor'.
        DB::statement("ALTER TABLE users MODIFY role ENUM('student','sluzbenik','profesor') NOT NULL DEFAULT 'student'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE users MODIFY role ENUM('student','sluzbenik') NOT NULL DEFAULT 'student'");
    }
};