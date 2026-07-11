<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Org\DepartmentRequest;
use App\Http\Resources\DepartmentResource;
use App\Models\Department;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/** HR-admin-only CRUD for departments (gated in routes/api.php). */
class DepartmentController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return DepartmentResource::collection(
            Department::withCount(['positions', 'employees'])->orderBy('name')->get(),
        );
    }

    public function store(DepartmentRequest $request): JsonResponse
    {
        $department = Department::create($request->validated());

        return (new DepartmentResource($department))->response()->setStatusCode(201);
    }

    public function show(Department $department): DepartmentResource
    {
        return new DepartmentResource($department->loadCount(['positions', 'employees']));
    }

    public function update(DepartmentRequest $request, Department $department): DepartmentResource
    {
        $department->update($request->validated());

        return new DepartmentResource($department);
    }

    public function destroy(Department $department): JsonResponse
    {
        try {
            $department->delete();
        } catch (QueryException) {
            // FK restrict fired — the department still has positions/employees
            return response()->json([
                'message' => 'Cannot delete: this department still has positions or employees assigned.',
            ], 409);
        }

        return response()->json(['message' => 'Department deleted.']);
    }
}
