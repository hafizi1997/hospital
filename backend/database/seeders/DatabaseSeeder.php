<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create all roles
        foreach (['admin', 'doctor', 'nurse', 'receptionist'] as $role) {
            Role::firstOrCreate(['name' => $role, 'guard_name' => 'web']);
        }

        // Create default admin (idempotent — safe to re-run)
        $admin = User::firstOrCreate(
            ['email' => 'admin@hospitalrun.local'],
            [
                'name'     => 'Administrator',
                'password' => 'Admin@12345678!',
            ]
        );

        $admin->syncRoles(['admin']);
    }
}
