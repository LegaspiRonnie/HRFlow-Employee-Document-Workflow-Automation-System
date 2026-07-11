<?php

namespace App\Http\Requests\Documents;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * A manager or HR decision on a request. Comments are mandatory when
 * rejecting — the employee must always know why.
 */
class DecisionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // role middleware + controller scope checks gate this
    }

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'action' => ['required', Rule::in(['approve', 'reject'])],
            'comments' => ['required_if:action,reject', 'nullable', 'string', 'max:500'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'comments.required_if' => 'A comment explaining the rejection is required.',
        ];
    }
}
