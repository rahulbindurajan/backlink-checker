<?php

/**
 * routes/tools.php — SEO Tool Routes
 *
 * All SEO tool routes live here, grouped under /tools.
 * To add a new tool (e.g. Keyword Research), simply add its routes below.
 *
 * Middleware applied to the group:
 *   - auth     : user must be logged in
 *   - verified : email must be verified (can remove if you don't need this)
 *
 * Naming convention:  tools.<tool-name>.<action>
 * URL convention:     /tools/<tool-name>/<action>
 */

use App\Http\Controllers\Tools\BacklinkController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])
    ->prefix('tools')
    ->name('tools.')
    ->group(function () {

        // ── Backlink Checker ──────────────────────────────────────────────────
        // GET  /tools/backlink-checker            → show the tool page
        // POST /tools/backlink-checker/analyze    → run a search
        // DELETE /tools/backlink-checker/history/{searchHistory} → delete one record

        Route::get('backlink-checker', [BacklinkController::class, 'index'])
            ->name('backlink-checker');

        Route::post('backlink-checker/analyze', [BacklinkController::class, 'analyze'])
            ->name('backlink-checker.analyze');

        Route::delete('backlink-checker/history/{searchHistory}', [BacklinkController::class, 'destroyHistory'])
            ->name('backlink-checker.history.destroy');

        // ── Future tools go here ──────────────────────────────────────────────
        // Route::get('keyword-research', [KeywordController::class, 'index'])->name('keyword-research');
        // Route::get('site-audit',       [SiteAuditController::class, 'index'])->name('site-audit');
        // Route::get('rank-tracker',     [RankTrackerController::class, 'index'])->name('rank-tracker');

    });
