<?php

namespace App\Models;

use App\Enums\RequestStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable(['employee_id', 'document_type_id', 'purpose', 'status'])]
class DocumentRequest extends Model
{
    protected function casts(): array
    {
        return ['status' => RequestStatus::class];
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function documentType(): BelongsTo
    {
        return $this->belongsTo(DocumentType::class);
    }

    /** Manager/HR decisions in chronological order (Feature 7+). */
    public function approvals(): HasMany
    {
        return $this->hasMany(RequestApproval::class)->orderBy('created_at');
    }

    /** The latest generated PDF for this request (Feature 9). */
    public function generatedDocument(): HasOne
    {
        return $this->hasOne(GeneratedDocument::class)->latestOfMany('version');
    }
}
