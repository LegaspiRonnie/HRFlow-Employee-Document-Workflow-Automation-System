<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Employees\StoreEmployeeRequest;
use App\Http\Requests\Employees\UpdateEmployeeRequest;
use App\Http\Resources\EmployeeResource;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

/** HR-admin-only employee management (gated in routes/api.php). */
class EmployeeController extends Controller
{
    private const RELATIONS = ['user', 'department', 'position', 'manager'];

    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Employee::with(self::RELATIONS)
            ->join('users', 'users.id', '=', 'employees.user_id')
            ->orderBy('users.name')
            ->select('employees.*');

        // optional ?search= by name / email / employee code
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('users.name', 'like', "%{$search}%")
                    ->orWhere('users.email', 'like', "%{$search}%")
                    ->orWhere('employees.employee_code', 'like', "%{$search}%");
            });
        }

        return EmployeeResource::collection($query->get());
    }

    /** Dropdown source: users who can be assigned as approving managers. */
    public function managers(): JsonResponse
    {
        $managers = User::whereIn('role', ['manager', 'hr_admin'])
            ->orderBy('name')
            ->get(['id', 'name', 'role']);

        return response()->json(['data' => $managers]);
    }

    public function store(StoreEmployeeRequest $request): JsonResponse
    {
        $data = $request->validated();

        // Account + employment record must appear together or not at all.
        $employee = DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $data['password'], // hashed by model cast
                'role' => $data['role'],
            ]);

            return Employee::create([
                'user_id' => $user->id,
                'employee_code' => Employee::nextCode(),
                'department_id' => $data['department_id'],
                'position_id' => $data['position_id'],
                'manager_id' => $data['manager_id'] ?? null,
                'date_hired' => $data['date_hired'],
                'phone' => $data['phone'] ?? null,
                'address' => $data['address'] ?? null,
                'salary' => $data['salary'] ?? null,
                'status' => $data['status'],
            ]);
        });

        return (new EmployeeResource($employee->load(self::RELATIONS)))
            ->response()->setStatusCode(201);
    }

    public function show(Employee $employee): EmployeeResource
    {
        return new EmployeeResource($employee->load(self::RELATIONS));
    }

    public function update(UpdateEmployeeRequest $request, Employee $employee): EmployeeResource
    {
        $data = $request->validated();

        DB::transaction(function () use ($data, $employee) {
            $userFields = [
                'name' => $data['name'],
                'email' => $data['email'],
                'role' => $data['role'],
            ];
            if (! empty($data['password'])) {
                $userFields['password'] = $data['password'];
            }
            $employee->user->update($userFields);

            $employee->update([
                'department_id' => $data['department_id'],
                'position_id' => $data['position_id'],
                'manager_id' => $data['manager_id'] ?? null,
                'date_hired' => $data['date_hired'],
                'phone' => $data['phone'] ?? null,
                'address' => $data['address'] ?? null,
                'salary' => $data['salary'] ?? null,
                'status' => $data['status'],
            ]);
        });

        return new EmployeeResource($employee->fresh(self::RELATIONS));
    }

    public function destroy(Employee $employee): JsonResponse
    {
        try {
            // Deleting the USER cascades to the employee record and revokes
            // all their tokens. Blocked (409) once documents reference them.
            $employee->user->delete();
        } catch (QueryException) {
            return response()->json([
                'message' => 'Cannot delete: this employee has document history. Set them to inactive instead.',
            ], 409);
        }

        return response()->json(['message' => 'Employee deleted.']);
    }
}
