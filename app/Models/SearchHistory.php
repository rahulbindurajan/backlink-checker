<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * SearchHistory model
 *
 * Represents one domain-lookup performed by an authenticated user.
 * Each SEO tool that adds its own "search" should either:
 *   (a) add a new model+table, or
 *   (b) add a `tool_type` column here and scope queries accordingly.
 *
 * @property int    $id
 * @property int    $user_id
 * @property string $domain
 * @property array  $result_summary  Decoded JSON: key metrics snapshot
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 */
class SearchHistory extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     * Only these fields can be set via SearchHistory::create([...]).
     */
    protected $fillable = [
        'user_id',
        'domain',
        'result_summary',
    ];

    /**
     * Cast result_summary from a JSON string in the DB to a PHP array
     * automatically whenever you access $history->result_summary.
     */
    protected $casts = [
        'result_summary' => 'array',
    ];

    // ─── Relationships ────────────────────────────────────────────────────────

    /**
     * A search history entry belongs to one user.
     * Usage: $history->user
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
