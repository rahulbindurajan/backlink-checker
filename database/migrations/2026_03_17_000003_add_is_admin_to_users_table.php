<?php

/**
 * Migration: add_is_admin_to_users_table
 *
 * Adds a simple boolean flag to identify super admin accounts.
 * Defaults to false — regular users are never admins unless explicitly promoted.
 *
 * To promote a user to admin, run the artisan command:
 *   php artisan admin:make your@email.com
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Place it after the email column for logical grouping
            $table->boolean('is_admin')->default(false)->after('email');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('is_admin');
        });
    }
};
