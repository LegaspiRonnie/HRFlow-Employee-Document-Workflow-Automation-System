<?php

namespace App\Http\Requests\Org;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** Shared by store and update, like DepartmentRequest. */
class PositionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // role:hr_admin middleware already gates the route
    }

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        $id = $this->route('position')?->id;

        return [
            'title' => [
                'required', 'string', 'max:255',
                // unique per department, not globally
                Rule::unique('positions', 'title')
                    ->where('department_id', $this->input('department_id'))
                    ->ignore($id),
            ],
            'department_id' => ['required', 'integer', 'exists:departments,id'],
            'description' => ['nullable', 'string', 'max:255'],
        ];
    }
}
