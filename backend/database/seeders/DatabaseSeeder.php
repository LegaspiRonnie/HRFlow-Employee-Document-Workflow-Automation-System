<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Master seeder — each feature adds its seeder here in dependency order.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class, // Feature 1: demo user per role
        ]);
    }
}
