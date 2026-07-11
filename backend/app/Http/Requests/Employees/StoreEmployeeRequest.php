<?php

namespace App\Http\Requests\Employees;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Creating an employee also provisions their login account, so this
 * validates both the user fields and the employment fields.
 */
class StoreEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // role:hr_admin middleware gates the route
    }

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            // account
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', Rule::in(['employee', 'manager', 'hr_admin'])],
            // employment
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
