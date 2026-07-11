<?php

namespace App\Http\Requests\Org;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Shared by store and update — the unique rules ignore the department
 * being edited (route('department') is null on store, so ignore(null)
 * is a no-op there).
 */
class DepartmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // role:hr_admin middleware already gates the route
    }

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        $id = $this->route('department')?->id;

        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('departments', 'name')->ignore($id)],
            'code' => ['required', 'string', 'max:10', 'alpha_num:ascii', Rule::unique('departments', 'code')->ignore($id)],
            'description' => ['nullable', 'string', 'max:255'],
        ];
    }

    /** Normalize the code to uppercase before validating. */
    protected function prepareForValidation(): void
    {
        if (is_string($this->code)) {
            $this->merge(['code' => strtoupper($this->code)]);
        }
    }
}
