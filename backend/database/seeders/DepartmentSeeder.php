<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Position;
use Illuminate\Database\Seeder;

/** Realistic org structure; idempotent via updateOrCreate. */
class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        $org = [
            'ENG' => ['name' => 'Engineering', 'positions' => ['Software Engineer', 'Senior Software Engineer', 'QA Engineer']],
            'HR' => ['name' => 'Human Resources', 'positions' => ['HR Officer', 'HR Manager']],
            'FIN' => ['name' => 'Finance', 'positions' => ['Accountant', 'Payroll Specialist']],
            'SLS' => ['name' => 'Sales', 'positions' => ['Account Executive', 'Sales Manager']],
            'OPS' => ['name' => 'Operations', 'positions' => ['Operations Coordinator', 'Operations Manager']],
        ];

        foreach ($org as $code => $data) {
            $department = Department::updateOrCreate(
                ['code' => $code],
                ['name' => $data['name']],
            );

            foreach ($data['positions'] as $title) {
                Position::updateOrCreate(
                    ['title' => $title, 'department_id' => $department->id],
                    [],
                );
            }
        }
    }
}
