<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Models\SearchHistory;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin DashboardController
 *
 * Shows the admin overview page at GET /admin.
 * Provides high-level stats about the application.
 */
class DashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/dashboard', [
            'stats' => [
                // User stats
                'total_users'  => User::count(),
                'admin_users'  => User::where('is_admin', true)->count(),

                // Usage stats
                'total_searches' => SearchHistory::count(),
                'searches_today' => SearchHistory::whereDate('created_at', today())->count(),

                // API configuration status
                'api_configured' => AppSetting::has('dataforseo_login')
                                 && AppSetting::has('dataforseo_password'),
                'sandbox_mode'   => AppSetting::getValue('dataforseo_sandbox') === 'true',
            ],

            // Last 5 registered users for quick overview
            'recent_users' => User::latest()
                ->take(5)
                ->get(['id', 'name', 'email', 'is_admin', 'created_at'])
                ->toArray(),
        ]);
    }
}
