<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Metadata only — the PDF itself is fetched through the authorized
 * download endpoint, and the verification token never leaves the QR.
 *
 * @property \App\Models\GeneratedDocument $resource
 */
class GeneratedDocumentResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'document_number' => $this->resource->document_number,
            'version' => $this->resource->version,
            'expires_at' => $this->resource->expires_at?->toDateString(),
            'created_at' => $this->resource->created_at->toIso8601String(),
        ];
    }
}
