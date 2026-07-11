<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @property \App\Models\RequestApproval $resource */
class RequestApprovalResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'stage' => $this->resource->stage,     // 'manager' | 'hr'
            'action' => $this->resource->action,   // 'approved' | 'rejected'
            'comments' => $this->resource->comments,
            'approver' => [
                'id' => $this->resource->approver->id,
                'name' => $this->resource->approver->name,
            ],
            'created_at' => $this->resource->created_at->toIso8601String(),
        ];
    }
}
