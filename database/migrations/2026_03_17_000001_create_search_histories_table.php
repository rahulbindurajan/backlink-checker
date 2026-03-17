<?php

/**
 * Migration: create_search_histories_table
 *
 * Stores each domain search a user performs.
 * The result_summary column holds a JSON snapshot of the API response
 * so the history list can display key metrics without re-fetching.
 *
 * Future SEO tools (keyword research, site audit, etc.) should add their
 * own tables or extend this one with a "tool_type" discriminator column.
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('search_histories', function (Blueprint $table) {
            $table->id();

            // Which user performed this search
            $table->foreignId('user_id')
                  ->constrained()        // references users.id
                  ->cascadeOnDelete();   // delete history when user is deleted

            // The domain that was analysed, e.g. "example.com"
            $table->string('domain');

            // Lightweight JSON snapshot: total_count, referring_domains, rank, etc.
            // Stored so the history sidebar can show metrics without extra API calls.
            $table->json('result_summary')->nullable();

            $table->timestamps(); // created_at = when the search was made
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('search_histories');
    }
};
