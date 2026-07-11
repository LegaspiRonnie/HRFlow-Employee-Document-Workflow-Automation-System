/** Mirrors DepartmentResource / PositionResource on the backend. */

export interface Department {
  id: number
  name: string
  code: string
  description: string | null
  positions_count?: number
  employees_count?: number
}

export interface Position {
  id: number
  title: string
  description: string | null
  department_id: number
  department?: Department
}

/** Payloads for create/update forms. */
export interface DepartmentInput {
  name: string
  code: string
  description: string
}

export interface PositionInput {
  title: string
  department_id: number | ''
  description: string
}
