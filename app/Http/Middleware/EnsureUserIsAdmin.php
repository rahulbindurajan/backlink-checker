<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * EnsureUserIsAdmin middleware
 *
 * Protects all /admin/* routes.
 * If the user is not logged in → redirect to login.
 * If the user is logged in but not an admin → abort with 403 Forbidden.
 *
 * Register alias in bootstrap/app.php:
 *   $middleware->alias(['admin' => EnsureUserIsAdmin::class]);
 *
 * Usage in routes/admin.php:
 *   Route::middleware(['auth', 'admin'])->group(function () { ... });
 *
 * To make a user an admin, run:
 *   php artisan admin:make your@email.com
 */
class EnsureUserIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        // Not logged in → send to login page
        if (! $request->user()) {
            return redirect()->route('login');
        }

        // Logged in but not an admin → show 403 error page
        if (! $request->user()->isAdmin()) {
            abort(403, 'Access denied. This area is restricted to administrators.');
        }

        return $next($request);
    }
}
