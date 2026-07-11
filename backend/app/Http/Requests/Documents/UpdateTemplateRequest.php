<?php

namespace App\Http\Requests\Documents;

use Illuminate\Foundation\Http\FormRequest;

/** HR edits a template's HTML body and active flag. */
class UpdateTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // role:hr_admin middleware gates the route
    }

    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return [
            'body' => ['required', 'string', 'max:65000'],
            'is_active' => ['required', 'boolean'],
        ];
    }
}
