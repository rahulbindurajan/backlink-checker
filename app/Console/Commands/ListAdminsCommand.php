<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

/**
 * ListAdminsCommand
 *
 * Lists all current super admin users.
 *
 * Usage:
 *   php artisan admin:list
 */
class ListAdminsCommand extends Command
{
    protected $signature = 'admin:list';

    protected $description = 'List all super admin users';

    public function handle(): int
    {
        $admins = User::where('is_admin', true)->get(['name', 'email', 'created_at']);

        if ($admins->isEmpty()) {
            $this->warn('No admin users found.');
            $this->line('Run: php artisan admin:make your@email.com');
            return self::SUCCESS;
        }

        $this->table(
            ['Name', 'Email', 'Registered'],
            $admins->map(fn ($u) => [
                $u->name,
                $u->email,
                $u->created_at->format('Y-m-d'),
            ])->toArray()
        );

        return self::SUCCESS;
    }
}
