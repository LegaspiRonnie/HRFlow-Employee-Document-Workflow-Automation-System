<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * The one canonical JSON shape for a user everywhere in the API.
 * Never expose the raw model — this guarantees password/token fields
 * can never leak and the frontend User interface stays in sync.
 *
 * @property \App\Models\User $resource
 */
class UserResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'name' => $this->resource->name,
            'email' => $this->resource->email,
            'role' => $this->resource->role->value, // 'employee' | 'manager' | 'hr_admin'
        ];
    }
}
