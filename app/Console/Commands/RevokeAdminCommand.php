<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

/**
 * RevokeAdminCommand
 *
 * Removes admin privileges from a user.
 *
 * Usage:
 *   php artisan admin:revoke their@email.com
 */
class RevokeAdminCommand extends Command
{
    protected $signature = 'admin:revoke {email : The email address of the admin to demote}';

    protected $description = 'Remove super admin privileges from a user';

    public function handle(): int
    {
        $email = $this->argument('email');

        $user = User::where('email', $email)->first();

        if (! $user) {
            $this->error("No user found with email: {$email}");
            return self::FAILURE;
        }

        if (! $user->isAdmin()) {
            $this->warn("{$user->name} ({$email}) is not an admin.");
            return self::SUCCESS;
        }

        $user->update(['is_admin' => false]);

        $this->info("✓ Admin privileges removed from {$user->name} ({$email}).");

        return self::SUCCESS;
    }
}
