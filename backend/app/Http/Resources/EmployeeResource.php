<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @property \App\Models\Employee $resource */
class EmployeeResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'employee_code' => $this->resource->employee_code,
            'user' => new UserResource($this->whenLoaded('user')),
            'department' => new DepartmentResource($this->whenLoaded('department')),
            'position' => new PositionResource($this->whenLoaded('position')),
            'manager' => $this->whenLoaded(
                'manager',
                fn () => $this->resource->manager ? [
                    'id' => $this->resource->manager->id,
                    'name' => $this->resource->manager->name,
                ] : null,
            ),
            'date_hired' => $this->resource->date_hired->toDateString(),
            'phone' => $this->resource->phone,
            'address' => $this->resource->address,
            // salary is sensitive: only HR admins (and the owner) receive it
            'salary' => $this->when(
                $request->user()?->isHrAdmin() || $request->user()?->id === $this->resource->user_id,
                $this->resource->salary,
            ),
            'status' => $this->resource->status,
        ];
    }
}
