<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'user_id', 'employee_code', 'department_id', 'position_id',
    'manager_id', 'date_hired', 'phone', 'address', 'salary', 'status',
])]
class Employee extends Model
{
    protected function casts(): array
    {
        return [
            'date_hired' => 'date',
            'salary' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function position(): BelongsTo
    {
        return $this->belongsTo(Position::class);
    }

    /** The user (not employee) who reviews this employee's requests. */
    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    public function documentRequests(): HasMany
    {
        return $this->hasMany(DocumentRequest::class);
    }

    /** Next sequential employee code, e.g. EMP-0007. */
    public static function nextCode(): string
    {
        $next = (int) (self::max('id') ?? 0) + 1;

        return sprintf('EMP-%04d', $next);
    }
}
