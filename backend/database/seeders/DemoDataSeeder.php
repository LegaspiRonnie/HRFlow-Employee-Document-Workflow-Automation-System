<?php

namespace Database\Seeders;

use App\Enums\RequestStatus;
use App\Enums\UserRole;
use App\Models\AuditLog;
use App\Models\Department;
use App\Models\DocumentRequest;
use App\Models\DocumentType;
use App\Models\Employee;
use App\Models\Position;
use App\Models\User;
use App\Services\DocumentGeneratorService;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

/**
 * Bulk demo data: a ~30-person org across all five departments plus six
 * months of document-request history in every workflow state — pending,
 * awaiting HR, rejected at both stages, and completed WITH real generated
 * PDFs (download + QR verification work), matching approval rows, and a
 * populated audit log so dashboards/charts/queues all look lived-in.
 *
 * Deterministic (fixed RNG seed) and guarded: if a meaningful request
 * history already exists the seeder skips itself, so re-running
 * `db:seed` never duplicates the data.
 */
class DemoDataSeeder extends Seeder
{
    private const PURPOSES = [
        'Bank loan application',
        'Visa application',
        'Credit card application',
        'Apartment rental requirement',
        'Government ID renewal',
        'Scholarship application',
        'Travel requirements',
        'Pag-IBIG housing loan',
        'PhilHealth records update',
        'Car loan requirement',
    ];

    private const MANAGER_REJECTIONS = [
        'Purpose needs more detail — please specify the receiving institution.',
        'Duplicate of a request that is still in progress.',
        'Please coordinate with me first before requesting this document.',
    ];

    private const HR_REJECTIONS = [
        'Employee record needs updating before issuance — please contact HR.',
        'Compensation details cannot be disclosed for this purpose.',
        'Supporting details are insufficient for this document type.',
    ];

    public function run(): void
    {
        if (DocumentRequest::count() >= 40) {
            $this->command?->warn('Demo request history already present — skipping DemoDataSeeder.');

            return;
        }

        mt_srand(20260713); // deterministic demo data

        $this->seedStaff();
        $this->seedRequestHistory();
    }

    /**
     * A manager per department plus rank-and-file staff, all password
     * "password". Idempotent via updateOrCreate on email / user_id.
     */
    private function seedStaff(): void
    {
        $hrAdmin = User::where('email', 'hradmin@hrflow.test')->firstOrFail();
        $engManager = User::where('email', 'manager@hrflow.test')->firstOrFail();

        // [name, email, dept, position, role, managerEmail, hired, salary]
        $people = [
            // department heads (report to the HR admin for approval purposes)
            ['Carlos Mendoza', 'cmendoza@hrflow.test', 'SLS', 'Sales Manager', UserRole::Manager, 'hradmin@hrflow.test', '2019-03-11', 78000],
            ['Liza Fernandez', 'lfernandez@hrflow.test', 'OPS', 'Operations Manager', UserRole::Manager, 'hradmin@hrflow.test', '2018-08-20', 76000],
            ['Ramon Villanueva', 'rvillanueva@hrflow.test', 'FIN', 'Accountant', UserRole::Manager, 'hradmin@hrflow.test', '2019-10-01', 72000],
            // Engineering
            ['Paolo Ramos', 'pramos@hrflow.test', 'ENG', 'Software Engineer', UserRole::Employee, 'manager@hrflow.test', '2023-07-17', 46000],
            ['Andrea Lim', 'alim@hrflow.test', 'ENG', 'Senior Software Engineer', UserRole::Employee, 'manager@hrflow.test', '2021-02-08', 68000],
            ['Joshua Tan', 'jtan@hrflow.test', 'ENG', 'QA Engineer', UserRole::Employee, 'manager@hrflow.test', '2022-05-30', 43000],
            ['Kristine Bautista', 'kbautista@hrflow.test', 'ENG', 'QA Engineer', UserRole::Employee, 'manager@hrflow.test', '2024-01-15', 41000],
            ['Marvin Aquino', 'maquino@hrflow.test', 'ENG', 'Software Engineer', UserRole::Employee, 'manager@hrflow.test', '2024-09-02', 44000],
            // Human Resources
            ['Camille Torres', 'ctorres@hrflow.test', 'HR', 'HR Officer', UserRole::Employee, 'hradmin@hrflow.test', '2022-04-18', 38000],
            ['Dennis Ocampo', 'docampo@hrflow.test', 'HR', 'HR Officer', UserRole::Employee, 'hradmin@hrflow.test', '2023-11-06', 36000],
            // Finance
            ['Grace Salazar', 'gsalazar@hrflow.test', 'FIN', 'Payroll Specialist', UserRole::Employee, 'rvillanueva@hrflow.test', '2021-06-14', 42000],
            ['Patrick Uy', 'puy@hrflow.test', 'FIN', 'Accountant', UserRole::Employee, 'rvillanueva@hrflow.test', '2020-09-28', 48000],
            ['Jasmine Navarro', 'jnavarro@hrflow.test', 'FIN', 'Payroll Specialist', UserRole::Employee, 'rvillanueva@hrflow.test', '2024-03-04', 39000],
            // Sales
            ['Bianca Rivera', 'brivera@hrflow.test', 'SLS', 'Account Executive', UserRole::Employee, 'cmendoza@hrflow.test', '2022-01-24', 40000],
            ['Kevin Castillo', 'kcastillo@hrflow.test', 'SLS', 'Account Executive', UserRole::Employee, 'cmendoza@hrflow.test', '2023-08-07', 38000],
            ['Angela Flores', 'aflores@hrflow.test', 'SLS', 'Account Executive', UserRole::Employee, 'cmendoza@hrflow.test', '2021-11-15', 45000],
            ['Mark Domingo', 'mdomingo@hrflow.test', 'SLS', 'Account Executive', UserRole::Employee, 'cmendoza@hrflow.test', '2024-06-10', 36000],
            // Operations
            ['Rowena Cruz', 'rcruz@hrflow.test', 'OPS', 'Operations Coordinator', UserRole::Employee, 'lfernandez@hrflow.test', '2020-12-01', 37000],
            ['Jerome Padilla', 'jpadilla@hrflow.test', 'OPS', 'Operations Coordinator', UserRole::Employee, 'lfernandez@hrflow.test', '2023-02-27', 35000],
            ['Nicole Santiago', 'nsantiago@hrflow.test', 'OPS', 'Operations Coordinator', UserRole::Employee, 'lfernandez@hrflow.test', '2025-01-13', 34000],
        ];

        foreach ($people as [$name, $email, $deptCode, $positionTitle, $role, $managerEmail, $hired, $salary]) {
            $user = User::updateOrCreate(
                ['email' => $email],
                ['name' => $name, 'role' => $role, 'password' => 'password'],
            );

            $department = Department::where('code', $deptCode)->firstOrFail();
            $position = Position::where('title', $positionTitle)
                ->where('department_id', $department->id)->firstOrFail();
            $manager = User::where('email', $managerEmail)->first() ?? $engManager;

            Employee::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'employee_code' => Employee::where('user_id', $user->id)->value('employee_code') ?? Employee::nextCode(),
                    'department_id' => $department->id,
                    'position_id' => $position->id,
                    'manager_id' => $user->id === $hrAdmin->id ? null : $manager->id,
                    'date_hired' => $hired,
                    'salary' => $salary,
                    'status' => 'active',
                ],
            );
        }
    }

    /** Six months of requests in every workflow state. */
    private function seedRequestHistory(): void
    {
        $generator = app(DocumentGeneratorService::class);
        $hrAdmin = User::where('email', 'hradmin@hrflow.test')->firstOrFail();

        // requesters = everyone except the HR admin (she decides, not files)
        $employees = Employee::with('user')
            ->whereHas('user', fn ($q) => $q->where('role', '!=', UserRole::HrAdmin))
            ->get();

        // weight the classic certificates so "most requested" looks natural
        $types = DocumentType::orderBy('id')->get();
        $typePool = $types->concat([$types[0], $types[0], $types[0], $types[1], $types[1]])->values();

        $plan = [
            [RequestStatus::Completed, 38],
            [RequestStatus::PendingManager, 10],
            [RequestStatus::PendingHr, 6],
            [RequestStatus::ManagerRejected, 10],
            [RequestStatus::HrRejected, 6],
        ];

        $oldestDocument = null;

        foreach ($plan as [$status, $count]) {
            for ($i = 0; $i < $count; $i++) {
                $employee = $employees[mt_rand(0, $employees->count() - 1)];
                $manager = $employee->manager_id ? User::find($employee->manager_id) : $hrAdmin;
                $type = $typePool[mt_rand(0, $typePool->count() - 1)];

                // timeline: submission, then decisions hours-to-days apart
                $createdAt = (match ($status) {
                    RequestStatus::PendingManager => now()->subDays(mt_rand(0, 12)),
                    RequestStatus::PendingHr => now()->subDays(mt_rand(3, 18)),
                    default => now()->subDays(mt_rand(8, 175)),
                })->subMinutes(mt_rand(30, 700));
                $managerAt = $createdAt->copy()->addHours(mt_rand(2, 60));
                $hrAt = $managerAt->copy()->addHours(mt_rand(1, 90));

                $request = DocumentRequest::create([
                    'employee_id' => $employee->id,
                    'document_type_id' => $type->id,
                    'purpose' => self::PURPOSES[mt_rand(0, count(self::PURPOSES) - 1)],
                    'status' => $status,
                ]);

                $this->audit('request.submitted', $employee->user_id, 'DocumentRequest', $request->id, $createdAt);

                // manager stage (everything past pending_manager has one)
                if ($status !== RequestStatus::PendingManager) {
                    $managerRejected = $status === RequestStatus::ManagerRejected;
                    $this->approval($request, $manager->id, 'manager', $managerRejected, $managerAt,
                        $managerRejected ? self::MANAGER_REJECTIONS[mt_rand(0, 2)] : null);
                }

                // HR stage
                if (in_array($status, [RequestStatus::Completed, RequestStatus::HrRejected], true)) {
                    $hrRejected = $status === RequestStatus::HrRejected;
                    $this->approval($request, $hrAdmin->id, 'hr', $hrRejected, $hrAt,
                        $hrRejected ? self::HR_REJECTIONS[mt_rand(0, 2)] : null);
                }

                // real PDF for completed requests, backdated to the HR decision
                if ($status === RequestStatus::Completed) {
                    $document = $generator->generate($request, $hrAdmin);
                    $document->timestamps = false;
                    $document->created_at = $hrAt;
                    $document->updated_at = $hrAt;
                    $document->expires_at = $hrAt->copy()->addMonths(6);
                    $document->save();

                    if ($oldestDocument === null || $hrAt->lt($oldestDocument->created_at)) {
                        $oldestDocument = $document;
                    }
                }

                // backdate the request itself; updated_at = last activity
                // (avg-approval-time on the dashboard reads these columns)
                $request->timestamps = false;
                $request->created_at = $createdAt;
                $request->updated_at = match ($status) {
                    RequestStatus::PendingManager => $createdAt,
                    RequestStatus::PendingHr, RequestStatus::ManagerRejected => $managerAt,
                    default => $hrAt,
                };
                $request->save();
            }
        }

        // one lapsed certificate so the public verify page can show the
        // "authentic but expired" state in demos
        if ($oldestDocument !== null) {
            $oldestDocument->timestamps = false;
            $oldestDocument->expires_at = now()->subDays(14);
            $oldestDocument->save();
        }
    }

    private function approval(
        DocumentRequest $request,
        int $approverId,
        string $stage,
        bool $rejected,
        Carbon $at,
        ?string $comments,
    ): void {
        $row = $request->approvals()->create([
            'approver_id' => $approverId,
            'stage' => $stage,
            'action' => $rejected ? 'rejected' : 'approved',
            'comments' => $comments,
        ]);
        $row->timestamps = false;
        $row->created_at = $at;
        $row->updated_at = $at;
        $row->save();

        $action = $stage === 'manager'
            ? ($rejected ? 'request.manager_rejected' : 'request.manager_approved')
            : ($rejected ? 'request.hr_rejected' : 'request.hr_verified');
        $this->audit($action, $approverId, 'DocumentRequest', $request->id, $at);
    }

    private function audit(string $action, int $userId, string $subjectType, int $subjectId, Carbon $at): void
    {
        AuditLog::create([
            'user_id' => $userId,
            'action' => $action,
            'subject_type' => $subjectType,
            'subject_id' => $subjectId,
            'details' => null,
            'ip_address' => '127.0.0.1',
            'created_at' => $at,
        ]);
    }
}
