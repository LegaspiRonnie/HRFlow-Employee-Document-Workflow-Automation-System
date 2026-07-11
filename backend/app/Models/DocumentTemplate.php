<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['document_type_id', 'body', 'is_active'])]
class DocumentTemplate extends Model
{
    /** Placeholders HR may use in template bodies; shown in the editor. */
    public const PLACEHOLDERS = [
        '{{employee_name}}', '{{employee_code}}', '{{position}}', '{{department}}',
        '{{date_hired}}', '{{salary}}', '{{purpose}}', '{{current_date}}',
        '{{company_name}}', '{{document_number}}',
    ];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function documentType(): BelongsTo
    {
        return $this->belongsTo(DocumentType::class);
    }
}
