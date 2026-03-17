<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin ApiSettingsController
 *
 * Super-admin management of all third-party API credentials.
 * Accessible only via the /admin/api-settings route (protected by admin middleware).
 *
 * Currently manages:
 *   - DataForSEO (backlink checker, future SEO tools)
 *
 * To add a new third-party API in the future:
 *   1. Add its key constants in KEY_* below.
 *   2. Add its fields to the edit() props.
 *   3. Add its validation + saving logic in update().
 *   4. Add its form section in the React page.
 */
class ApiSettingsController extends Controller
{
    // ── Setting key constants ─────────────────────────────────────────────────
    // Centralise key names here so they're easy to find and refactor.

    private const DATAFORSEO_LOGIN    = 'dataforseo_login';
    private const DATAFORSEO_PASSWORD = 'dataforseo_password';
    private const DATAFORSEO_SANDBOX  = 'dataforseo_sandbox';

    // Future APIs — add their keys here:
    // private const SEMRUSH_API_KEY = 'semrush_api_key';
    // private const AHREFS_TOKEN    = 'ahrefs_token';

    // ─── edit ─────────────────────────────────────────────────────────────────

    /**
     * Show the admin API settings page.
     *
     * Props sent to the React page:
     *   apis       → array of API provider configs (name, keys, status)
     *   status     → flash message after save
     */
    public function edit(): Response
    {
        // Read DataForSEO settings (DB first, fall back to .env)
        $dataforseoLogin   = AppSetting::getValue(self::DATAFORSEO_LOGIN)
            ?? config('services.dataforseo.login', '');

        $dataforseoSandbox = AppSetting::getValue(self::DATAFORSEO_SANDBOX);
        $sandboxEnabled    = $dataforseoSandbox !== null
            ? filter_var($dataforseoSandbox, FILTER_VALIDATE_BOOLEAN)
            : (bool) config('services.dataforseo.sandbox', false);

        return Inertia::render('admin/api-settings', [
            'status' => session('status'),

            // Each API provider is its own object.
            // Add new providers to this array when integrating future APIs.
            'apis' => [
                'dataforseo' => [
                    'login'       => $dataforseoLogin ?? '',
                    'sandbox'     => $sandboxEnabled,
                    'hasPassword' => AppSetting::has(self::DATAFORSEO_PASSWORD),
                ],

                // Future APIs — uncomment and implement when ready:
                // 'semrush' => [
                //     'api_key'    => AppSetting::getValue(self::SEMRUSH_API_KEY) ?? '',
                //     'configured' => AppSetting::has(self::SEMRUSH_API_KEY),
                // ],
            ],
        ]);
    }

    // ─── update ───────────────────────────────────────────────────────────────

    /**
     * Save the API settings submitted from the admin form.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            // DataForSEO
            'dataforseo_login'    => ['required', 'string', 'email', 'max:255'],
            'dataforseo_password' => ['nullable', 'string', 'min:6', 'max:255'],
            'dataforseo_sandbox'  => ['required', 'boolean'],

            // Future APIs — add validation rules here when adding new providers:
            // 'semrush_api_key' => ['nullable', 'string', 'max:255'],
        ]);

        // ── DataForSEO ────────────────────────────────────────────────────────
        AppSetting::setValue(self::DATAFORSEO_LOGIN, $validated['dataforseo_login']);

        if (! empty($validated['dataforseo_password'])) {
            AppSetting::setValue(
                self::DATAFORSEO_PASSWORD,
                $validated['dataforseo_password'],
                encrypted: true
            );
        }

        AppSetting::setValue(
            self::DATAFORSEO_SANDBOX,
            $validated['dataforseo_sandbox'] ? 'true' : 'false'
        );

        // ── Future APIs — save their values here ──────────────────────────────
        // if (! empty($validated['semrush_api_key'])) {
        //     AppSetting::setValue(self::SEMRUSH_API_KEY, $validated['semrush_api_key'], encrypted: true);
        // }

        return redirect()->route('admin.api-settings.edit')
            ->with('status', 'api-settings-saved');
    }
}
