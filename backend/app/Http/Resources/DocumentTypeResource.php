<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @property \App\Models\DocumentType $resource */
class DocumentTypeResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'name' => $this->resource->name,
            'code' => $this->resource->code,
            'description' => $this->resource->description,
            // template body only ships when the controller loads it (HR pages)
            'template' => $this->whenLoaded('template', fn () => [
                'id' => $this->resource->template->id,
                'body' => $this->resource->template->body,
                'is_active' => $this->resource->template->is_active,
                'updated_at' => $this->resource->template->updated_at->toIso8601String(),
            ]),
        ];
    }
}
