<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

/**
 * MakeAdminCommand
 *
 * Promotes an existing user to super admin by their email address.
 *
 * Usage:
 *   php artisan admin:make your@email.com
 *
 * To revoke admin:
 *   php artisan admin:revoke your@email.com
 *
 * To list all current admins:
 *   php artisan admin:list
 */
class MakeAdminCommand extends Command
{
    /**
     * The name and signature of the artisan command.
     * {email} is a required argument you pass on the command line.
     */
    protected $signature = 'admin:make {email : The email address of the user to promote}';

    protected $description = 'Promote a registered user to super admin';

    public function handle(): int
    {
        $email = $this->argument('email');

        $user = User::where('email', $email)->first();

        if (! $user) {
            $this->error("No user found with email: {$email}");
            $this->line('Make sure the user has registered first.');
            return self::FAILURE;
        }

        if ($user->isAdmin()) {
            $this->warn("{$user->name} ({$email}) is already an admin.");
            return self::SUCCESS;
        }

        $user->update(['is_admin' => true]);

        $this->info("✓ {$user->name} ({$email}) has been promoted to super admin.");
        $this->line('They will see the Admin panel on their next page load.');

        return self::SUCCESS;
    }
}
