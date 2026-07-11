<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Department;
use App\Models\Employee;
use App\Models\Position;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Gives every demo user an employee record and adds two extra staff
 * reporting to the demo manager, so the manager queue has real data.
 * Idempotent: keyed on user email / employee user_id.
 */
class EmployeeSeeder extends Seeder
{
    public function run(): void
    {
        $eng = Department::where('code', 'ENG')->firstOrFail();
        $hr = Department::where('code', 'HR')->firstOrFail();
        $engineer = Position::where('title', 'Software Engineer')->firstOrFail();
        $seniorEng = Position::where('title', 'Senior Software Engineer')->firstOrFail();
        $hrManager = Position::where('title', 'HR Manager')->firstOrFail();

        $manager = User::where('email', 'manager@hrflow.test')->firstOrFail();
        $hrAdmin = User::where('email', 'hradmin@hrflow.test')->firstOrFail();
        $employee = User::where('email', 'employee@hrflow.test')->firstOrFail();

        // Extra staff so the manager queue is not empty in demos
        $extra1 = User::updateOrCreate(
            ['email' => 'jdelacruz@hrflow.test'],
            ['name' => 'Juan Dela Cruz', 'role' => UserRole::Employee, 'password' => 'password'],
        );
        $extra2 = User::updateOrCreate(
            ['email' => 'mgarcia@hrflow.test'],
            ['name' => 'Maria Garcia', 'role' => UserRole::Employee, 'password' => 'password'],
        );

        $records = [
            // [user, department, position, manager_user, date_hired, salary]
            [$employee, $eng, $engineer, $manager, '2023-02-13', 45000],
            [$extra1, $eng, $engineer, $manager, '2024-06-03', 42000],
            [$extra2, $eng, $engineer, $manager, '2022-11-21', 48000],
            [$manager, $eng, $seniorEng, $hrAdmin, '2020-05-04', 85000],
            [$hrAdmin, $hr, $hrManager, null, '2019-01-07', 90000],
        ];

        foreach ($records as [$user, $dept, $pos, $mgr, $hired, $salary]) {
            Employee::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'employee_code' => Employee::where('user_id', $user->id)->value('employee_code') ?? Employee::nextCode(),
                    'department_id' => $dept->id,
                    'position_id' => $pos->id,
                    'manager_id' => $mgr?->id,
                    'date_hired' => $hired,
                    'salary' => $salary,
                    'status' => 'active',
                ],
            );
        }
    }
}
