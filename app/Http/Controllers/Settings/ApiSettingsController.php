<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * ApiSettingsController
 *
 * Manages the "API Settings" page under /settings/api.
 * Lets the user save DataForSEO credentials and toggle sandbox mode
 * directly from the browser — no need to edit the .env file.
 *
 * Settings are stored in the `app_settings` table:
 *   dataforseo_login    → plain text (email address)
 *   dataforseo_password → encrypted  (API password)
 *   dataforseo_sandbox  → plain text ("true" or "false")
 *
 * The DataForSeoService reads from this table first, then falls back
 * to .env values if the DB rows don't exist yet.
 */
class ApiSettingsController extends Controller
{
    // ─── edit ─────────────────────────────────────────────────────────────────

    /**
     * Show the API Settings form.
     *
     * Props sent to the React page:
     *   - dataforseoLogin    : current login email (from DB or .env fallback)
     *   - dataforseoSandbox  : whether sandbox mode is currently on
     *   - hasPassword        : true if a password is already saved (we never
     *                          send the actual password to the frontend)
     *   - status             : flash message shown after a successful save
     */
    public function edit(): Response
    {
        // Read the current login — prefer DB value, fall back to .env
        $login = AppSetting::getValue('dataforseo_login')
            ?? config('services.dataforseo.login', '');

        // Sandbox: DB value → .env value → default false
        $sandboxDb = AppSetting::getValue('dataforseo_sandbox');
        $sandbox   = $sandboxDb !== null
            ? filter_var($sandboxDb, FILTER_VALIDATE_BOOLEAN)
            : (bool) config('services.dataforseo.sandbox', false);

        return Inertia::render('settings/api', [
            'dataforseoLogin'   => $login ?? '',
            'dataforseoSandbox' => $sandbox,
            // Tell the frontend a password is saved without exposing the value
            'hasPassword'       => AppSetting::has('dataforseo_password'),
            'status'            => session('status'),
        ]);
    }

    // ─── update ───────────────────────────────────────────────────────────────

    /**
     * Save the API settings submitted from the form.
     *
     * The password field is optional — if left blank, the existing
     * saved password is kept unchanged.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'dataforseo_login'    => ['required', 'string', 'email', 'max:255'],
            // Password is optional — blank means "keep existing"
            'dataforseo_password' => ['nullable', 'string', 'min:6', 'max:255'],
            'dataforseo_sandbox'  => ['required', 'boolean'],
        ]);

        // Save the login email as plain text
        AppSetting::setValue('dataforseo_login', $validated['dataforseo_login']);

        // Only update the password if a new one was provided
        if (! empty($validated['dataforseo_password'])) {
            AppSetting::setValue(
                'dataforseo_password',
                $validated['dataforseo_password'],
                encrypted: true   // always encrypt the API password in the DB
            );
        }

        // Save sandbox toggle as string "true" or "false"
        AppSetting::setValue(
            'dataforseo_sandbox',
            $validated['dataforseo_sandbox'] ? 'true' : 'false'
        );

        return redirect()->route('api-settings.edit')
            ->with('status', 'api-settings-saved');
    }
}
