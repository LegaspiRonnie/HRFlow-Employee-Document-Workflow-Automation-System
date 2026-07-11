<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Documents\UpdateTemplateRequest;
use App\Http\Resources\DocumentTypeResource;
use App\Models\DocumentTemplate;
use App\Models\DocumentType;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class DocumentTypeController extends Controller
{
    /**
     * GET /document-types — all roles. Used by the request form.
     * Only active-template types are requestable.
     */
    public function index(): AnonymousResourceCollection
    {
        return DocumentTypeResource::collection(
            DocumentType::whereHas('template', fn ($q) => $q->where('is_active', true))
                ->orderBy('name')->get(),
        );
    }

    /** GET /document-templates — HR only; includes editable bodies. */
    public function templates(): AnonymousResourceCollection
    {
        return DocumentTypeResource::collection(
            DocumentType::with('template')->orderBy('name')->get(),
        );
    }

    /** PUT /document-templates/{template} — HR edits body / active flag. */
    public function updateTemplate(
        UpdateTemplateRequest $request,
        DocumentTemplate $template,
    ): DocumentTypeResource {
        $template->update($request->validated());

        return new DocumentTypeResource($template->documentType->load('template'));
    }
}
