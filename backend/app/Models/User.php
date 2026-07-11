<?php

namespace App\Models;

use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'email', 'password', 'role'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            // role is always a UserRole enum in PHP land — no raw strings
            'role' => UserRole::class,
        ];
    }

    /** Convenience helpers used by middleware, Policies, and Blade later. */
    public function isEmployee(): bool
    {
        return $this->role === UserRole::Employee;
    }

    public function isManager(): bool
    {
        return $this->role === UserRole::Manager;
    }

    public function isHrAdmin(): bool
    {
        return $this->role === UserRole::HrAdmin;
    }
}
