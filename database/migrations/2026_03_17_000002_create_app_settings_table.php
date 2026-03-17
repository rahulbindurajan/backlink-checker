<?php

/**
 * Migration: create_app_settings_table
 *
 * A simple key-value store for application-wide settings that admins can
 * change via the UI (instead of editing .env directly).
 *
 * Examples of keys stored here:
 *   dataforseo_login    → API email
 *   dataforseo_password → API password (stored encrypted)
 *   dataforseo_sandbox  → "true" or "false"
 *
 * The `is_encrypted` flag tells the AppSetting model whether to
 * decrypt the value before returning it.
 *
 * To add settings for a future tool, just INSERT new rows — no migration needed.
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('app_settings', function (Blueprint $table) {
            $table->id();

            // Unique key, e.g. "dataforseo_login"
            $table->string('key')->unique();

            // The stored value — may be plain text or encrypted (see is_encrypted)
            $table->text('value')->nullable();

            // When true, the value is stored using Laravel's encrypt() and must
            // be decrypted before use. Use this for passwords and API keys.
            $table->boolean('is_encrypted')->default(false);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('app_settings');
    }
};
