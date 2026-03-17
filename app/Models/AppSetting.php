<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

/**
 * AppSetting model — global key-value settings store.
 *
 * Usage:
 *   // Read a value (returns null if key doesn't exist)
 *   $login = AppSetting::getValue('dataforseo_login');
 *
 *   // Save or update a plain-text value
 *   AppSetting::setValue('dataforseo_sandbox', 'true');
 *
 *   // Save or update an encrypted value (use for passwords/API keys)
 *   AppSetting::setValue('dataforseo_password', 'secret123', encrypted: true);
 *
 * @property int    $id
 * @property string $key
 * @property string|null $value
 * @property bool   $is_encrypted
 */
class AppSetting extends Model
{
    protected $fillable = ['key', 'value', 'is_encrypted'];

    protected $casts = [
        'is_encrypted' => 'boolean',
    ];

    // ─── Static helpers ───────────────────────────────────────────────────────

    /**
     * Read a setting value by key.
     * Automatically decrypts the value if it was stored as encrypted.
     *
     * @param  string $key  Setting key, e.g. "dataforseo_login"
     * @return string|null  Decrypted value, or null if the key doesn't exist
     */
    public static function getValue(string $key): ?string
    {
        $setting = static::where('key', $key)->first();

        if (! $setting || $setting->value === null) {
            return null;
        }

        if ($setting->is_encrypted) {
            try {
                return Crypt::decryptString($setting->value);
            } catch (\Exception) {
                // If decryption fails (e.g. APP_KEY changed), return null
                return null;
            }
        }

        return $setting->value;
    }

    /**
     * Save (insert or update) a setting value.
     *
     * @param  string $key        Setting key, e.g. "dataforseo_login"
     * @param  string $value      The value to store
     * @param  bool   $encrypted  When true, encrypts before storing (use for secrets)
     */
    public static function setValue(string $key, string $value, bool $encrypted = false): void
    {
        $storedValue = $encrypted ? Crypt::encryptString($value) : $value;

        // updateOrCreate: updates if key exists, inserts if it doesn't
        static::updateOrCreate(
            ['key'          => $key],
            ['value'        => $storedValue,
             'is_encrypted' => $encrypted]
        );
    }

    /**
     * Check if a setting exists in the database.
     */
    public static function has(string $key): bool
    {
        return static::where('key', $key)->whereNotNull('value')->exists();
    }
}
