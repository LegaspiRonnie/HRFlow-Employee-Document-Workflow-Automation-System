<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;

/**
 * One-line audit logging from anywhere:
 *
 *   AuditLogger::log('request.manager_approved', $documentRequest, ['comments' => ...]);
 *
 * Never throws — an audit failure must not break the business action.
 */
class AuditLogger
{
    /** @param array<string, mixed> $details */
    public static function log(string $action, ?Model $subject = null, array $details = []): void
    {
        try {
            AuditLog::create([
                'user_id' => auth()->id(),
                'action' => $action,
                'subject_type' => $subject ? class_basename($subject) : null,
                'subject_id' => $subject?->getKey(),
                'details' => $details ?: null,
                'ip_address' => request()->ip(),
                'created_at' => now(),
            ]);
        } catch (\Throwable) {
            report_if(app()->isProduction() === false, new \RuntimeException("Audit log failed for {$action}"));
        }
    }
}
