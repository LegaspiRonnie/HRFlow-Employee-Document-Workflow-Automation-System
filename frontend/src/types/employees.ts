import type { Role, User } from './auth'
import type { Department, Position } from './org'

/** Mirrors EmployeeResource on the backend. */
export interface Employee {
  id: number
  employee_code: string
  user: User
  department: Department
  position: Position
  manager: { id: number; name: string } | null
  date_hired: string
  phone: string | null
  address: string | null
  salary?: string | null // present only for HR admins / the owner
  status: 'active' | 'inactive'
}

/** Users assignable as approving managers (GET /employees/managers). */
export interface ManagerOption {
  id: number
  name: string
  role: Role
}

/** Payload for HR create/edit forms. */
export interface EmployeeInput {
  name: string
  email: string
  password: string // ignored (may be blank) on update
  role: Role
  department_id: number | ''
  position_id: number | ''
  manager_id: number | ''
  date_hired: string
  phone: string
  address: string
  salary: string
  status: 'active' | 'inactive'
}
