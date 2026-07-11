<?php

namespace App\Http\Requests\Employees;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Employees may only edit their own contact details — never their
 * department, salary, role, etc. (that's HR's job via employee CRUD).
 */
class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // any authenticated user edits only their own record
    }

    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return [
            'phone' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string', 'max:255'],
        ];
    }
}
