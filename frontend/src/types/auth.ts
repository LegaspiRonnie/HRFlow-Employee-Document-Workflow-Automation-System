/** Mirrors App\Enums\UserRole on the backend — keep the two in sync. */
export type Role = 'employee' | 'manager' | 'hr_admin'

/** Mirrors App\Http\Resources\UserResource. */
export interface User {
  id: number
  name: string
  email: string
  role: Role
}

/** Shape of POST /auth/login's success response. */
export interface LoginResponse {
  token: string
  user: User
}

/** Human-friendly labels for role badges across the UI. */
export const ROLE_LABELS: Record<Role, string> = {
  employee: 'Employee',
  manager: 'Manager',
  hr_admin: 'HR Admin',
}
