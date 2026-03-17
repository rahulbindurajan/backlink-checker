<?php

/**
 * routes/admin.php — Super Admin Routes
 *
 * All routes here require:
 *   1. auth     — user must be logged in
 *   2. admin    — user must have is_admin = true (EnsureUserIsAdmin middleware)
 *
 * To add a new admin section (e.g. Users management):
 *   Route::get('users',         [UserController::class, 'index'])->name('users.index');
 *   Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
 */

use App\Http\Controllers\Admin\ApiSettingsController;
use App\Http\Controllers\Admin\DashboardController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {

        // ── Dashboard ─────────────────────────────────────────────────────────
        // GET /admin
        Route::get('/', [DashboardController::class, 'index'])
            ->name('dashboard');

        // ── API Settings ──────────────────────────────────────────────────────
        // GET  /admin/api-settings  → show form
        // POST /admin/api-settings  → save credentials
        Route::get('api-settings',  [ApiSettingsController::class, 'edit'])
            ->name('api-settings.edit');

        Route::post('api-settings', [ApiSettingsController::class, 'update'])
            ->name('api-settings.update');

        // ── Future admin sections go here ─────────────────────────────────────
        // Route::resource('users', UserController::class)->only(['index','destroy']);
        // Route::get('activity-log', [ActivityController::class, 'index'])->name('activity');

    });
