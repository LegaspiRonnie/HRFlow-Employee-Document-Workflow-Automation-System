<?php

namespace App\Enums;

/**
 * Workflow states of a document request:
 *
 *   pending_manager ──approve──▶ pending_hr ──verify──▶ completed
 *        │                          │
 *      reject                     reject
 *        ▼                          ▼
 *   manager_rejected           hr_rejected
 *
 * Rejections are terminal; the employee submits a new request after
 * addressing the comments.
 */
enum RequestStatus: string
{
    case PendingManager = 'pending_manager';
    case ManagerRejected = 'manager_rejected';
    case PendingHr = 'pending_hr';
    case HrRejected = 'hr_rejected';
    case Completed = 'completed';

    public function label(): string
    {
        return match ($this) {
            self::PendingManager => 'Pending Manager Review',
            self::ManagerRejected => 'Rejected by Manager',
            self::PendingHr => 'Pending HR Verification',
            self::HrRejected => 'Rejected by HR',
            self::Completed => 'Completed',
        };
    }
}
