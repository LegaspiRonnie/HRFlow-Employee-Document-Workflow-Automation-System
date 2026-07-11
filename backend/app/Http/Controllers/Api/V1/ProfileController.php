<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Employees\UpdateProfileRequest;
use App\Http\Resources\EmployeeResource;
use Illuminate\Http\Request;

/**
 * The signed-in user's own employee record. Any role can read/update
 * their own contact details; employment fields stay HR-only.
 */
class ProfileController extends Controller
{
    private const RELATIONS = ['user', 'department', 'position', 'manager'];

    public function show(Request $request): EmployeeResource
    {
        $employee = $request->user()->employee()->with(self::RELATIONS)->firstOrFail();

        return new EmployeeResource($employee);
    }

    public function update(UpdateProfileRequest $request): EmployeeResource
    {
        $employee = $request->user()->employee()->firstOrFail();
        $employee->update($request->validated());

        return new EmployeeResource($employee->load(self::RELATIONS));
    }
}
