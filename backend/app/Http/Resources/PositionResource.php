<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @property \App\Models\Position $resource */
class PositionResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'title' => $this->resource->title,
            'description' => $this->resource->description,
            'department_id' => $this->resource->department_id,
            'department' => new DepartmentResource($this->whenLoaded('department')),
        ];
    }
}
