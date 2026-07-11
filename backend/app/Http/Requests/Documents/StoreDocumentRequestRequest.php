<?php

namespace App\Http\Requests\Documents;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** Employee submits a new document request. */
class StoreDocumentRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        // any authenticated user with an employee record may request;
        // the controller resolves (and requires) that record
        return true;
    }

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'document_type_id' => [
                'required', 'integer',
                // only types whose template is active are requestable
                Rule::exists('document_types', 'id'),
                Rule::exists('document_templates', 'document_type_id')->where('is_active', true),
            ],
            'purpose' => ['required', 'string', 'min:5', 'max:500'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'document_type_id.exists' => 'This document type is not currently available for request.',
        ];
    }
}
