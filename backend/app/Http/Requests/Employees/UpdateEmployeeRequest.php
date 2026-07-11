<?php

namespace App\Http\Requests\Employees;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** Password is optional on update; email unique ignores the linked user. */
class UpdateEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // role:hr_admin middleware gates the route
    }

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        $userId = $this->route('employee')?->user_id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($userId)],
            'password' => ['nullable', 'string', 'min:8'],
            'role' => ['required', Rule::in(['employee', 'manager', 'hr_admin'])],
            'department_id' => ['required', 'integer', 'exists:departments,id'],
            'position_id' => ['required', 'integer', 'exists:positions,id'],
            'manager_id' => ['nullable', 'integer', 'exists:users,id'],
            'date_hired' => ['required', 'date'],
            'phone' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string', 'max:255'],
            'salary' => ['nullable', 'numeric', 'min:0', 'max:99999999.99'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ];
    }
}
