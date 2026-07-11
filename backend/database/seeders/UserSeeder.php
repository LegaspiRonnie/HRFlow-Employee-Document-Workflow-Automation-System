<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * One demo account per role, password "password" for all three.
 * updateOrCreate makes the seeder idempotent — safe to re-run anytime.
 */
class UserSeeder extends Seeder
{
    public function run(): void
    {
        $demoUsers = [
            ['name' => 'Erika Cruz', 'email' => 'employee@hrflow.test', 'role' => UserRole::Employee],
            ['name' => 'Miguel Santos', 'email' => 'manager@hrflow.test', 'role' => UserRole::Manager],
            ['name' => 'Hannah Reyes', 'email' => 'hradmin@hrflow.test', 'role' => UserRole::HrAdmin],
        ];

        foreach ($demoUsers as $demo) {
            User::updateOrCreate(
                ['email' => $demo['email']],
                [
                    'name' => $demo['name'],
                    'role' => $demo['role'],
                    'password' => 'password', // hashed automatically by the model cast
                ],
            );
        }
    }
}
