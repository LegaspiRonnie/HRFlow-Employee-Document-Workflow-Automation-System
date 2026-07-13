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
            UserSeeder::class,       // Feature 1: demo user per role
            DepartmentSeeder::class, // Feature 3: departments + positions
            EmployeeSeeder::class,   // Feature 4: employee records + extra staff
            DocumentTypeSeeder::class, // Feature 5: 10 document types + templates
            DemoDataSeeder::class,   // Bulk demo org + 6 months of request history
        ]);
    }
}
