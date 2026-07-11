<?php

namespace App\Enums;

/**
 * The three HRFlow roles. Backed by strings so the enum value is exactly
 * what is stored in the users.role column and what the API serializes.
 * Feature 2 builds role middleware and Policies on top of this enum.
 */
enum UserRole: string
{
    case Employee = 'employee';
    case Manager = 'manager';
    case HrAdmin = 'hr_admin';

    /** All raw values — handy for validation rules and migrations. */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
