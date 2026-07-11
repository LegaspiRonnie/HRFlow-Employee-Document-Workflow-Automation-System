<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @property \App\Models\DocumentRequest $resource */
class DocumentRequestResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'purpose' => $this->resource->purpose,
            'status' => $this->resource->status->value,
            'status_label' => $this->resource->status->label(),
            'document_type' => new DocumentTypeResource($this->whenLoaded('documentType')),
            // requester context — loaded on manager/HR queues
            'employee' => new EmployeeResource($this->whenLoaded('employee')),
            // decision trail, chronological
            'approvals' => RequestApprovalResource::collection($this->whenLoaded('approvals')),
            // latest generated PDF metadata (Feature 9)
            'generated_document' => new GeneratedDocumentResource($this->whenLoaded('generatedDocument')),
            'created_at' => $this->resource->created_at->toIso8601String(),
            'updated_at' => $this->resource->updated_at->toIso8601String(),
        ];
    }
}
