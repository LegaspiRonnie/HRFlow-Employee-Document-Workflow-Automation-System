<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'document_request_id', 'document_number', 'version', 'file_path',
    'verification_token', 'signature_hash', 'signed_by', 'expires_at', 'reminded_at',
])]
class GeneratedDocument extends Model
{
    protected function casts(): array
    {
        return ['expires_at' => 'date', 'reminded_at' => 'datetime'];
    }

    public function documentRequest(): BelongsTo
    {
        return $this->belongsTo(DocumentRequest::class);
    }

    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    /**
     * Next document number: HRF-<year>-<6-digit sequence>, sequence
     * resetting each year. Distinct numbers per request; versions of the
     * same request keep their original number.
     */
    public static function nextNumber(): string
    {
        $year = now()->year;
        $count = self::where('document_number', 'like', "HRF-{$year}-%")
            ->distinct('document_number')->count('document_number');

        return sprintf('HRF-%d-%06d', $year, $count + 1);
    }
}
